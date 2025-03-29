-- Complete Supabase setup with all necessary components

-- 1. Fix users table structure
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin') THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;

  -- Ensure token_identifier is nullable (for compatibility)
  ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;
END
$$;

-- 2. Create storage buckets if they don't exist
DO $$
BEGIN
  -- Create model-images bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('model-images', 'model-images', true)
  ON CONFLICT (id) DO NOTHING;

  -- Create model-documents bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('model-documents', 'model-documents', false)
  ON CONFLICT (id) DO NOTHING;

  -- Set up storage policies for model-images (public bucket)
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Public Read Access', 'model-images', '{"name":"Public Read Access","owner":"authenticated","deployment_id":"default","resources":["model-images"],"privileged":false,"operation":"read","actions":["select"],"condition":"true","fields":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;

  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Authenticated Users Can Upload', 'model-images', '{"name":"Authenticated Users Can Upload","owner":"authenticated","deployment_id":"default","resources":["model-images"],"privileged":false,"operation":"insert","actions":["insert"],"condition":"(auth.role() = \'authenticated\')","fields":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;

  -- Set up storage policies for model-documents (private bucket)
  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Authenticated Users Can Access Own Documents', 'model-documents', '{"name":"Authenticated Users Can Access Own Documents","owner":"authenticated","deployment_id":"default","resources":["model-documents"],"privileged":false,"operation":"read","actions":["select"],"condition":"(auth.uid() = storage.foldername(storage.filename(name)))","fields":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;

  INSERT INTO storage.policies (name, bucket_id, definition)
  VALUES ('Authenticated Users Can Upload Own Documents', 'model-documents', '{"name":"Authenticated Users Can Upload Own Documents","owner":"authenticated","deployment_id":"default","resources":["model-documents"],"privileged":false,"operation":"insert","actions":["insert"],"condition":"(auth.uid() = storage.foldername(storage.filename(name)))","fields":null}')
  ON CONFLICT (name, bucket_id) DO NOTHING;
END
$$;

-- 3. Create models table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  height TEXT NOT NULL,
  measurements TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  status TEXT NOT NULL CHECK (status IN ('Available', 'Booked', 'On Hold')),
  location TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Set up RLS for models table
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON public.models;
DROP POLICY IF EXISTS "Auth users can create" ON public.models;
DROP POLICY IF EXISTS "Auth users can update own models" ON public.models;
DROP POLICY IF EXISTS "Auth users can delete own models" ON public.models;
DROP POLICY IF EXISTS "Admins can manage all models" ON public.models;

-- Create policies
CREATE POLICY "Public read access"
  ON public.models FOR SELECT
  USING (true);

CREATE POLICY "Auth users can create"
  ON public.models FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth users can update own models"
  ON public.models FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Auth users can delete own models"
  ON public.models FOR DELETE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all models"
  ON public.models FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true));

-- 5. Fix user triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    user_id,
    email,
    name,
    full_name,
    avatar_url,
    token_identifier,
    is_admin,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id::text,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If there's a conflict, do nothing (user already exists)
    RETURN NEW;
  WHEN others THEN
    -- Log other errors but don't fail the transaction
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Fix user update trigger
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET
    email = NEW.email,
    name = NEW.raw_user_meta_data->>'name',
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    is_admin = COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    updated_at = NEW.updated_at
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log errors but don't fail the transaction
    RAISE WARNING 'Error in handle_user_update trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create a trigger to call the function when a user is updated in auth.users
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- 7. Enable realtime for models table
DO $
BEGIN
  -- Check if the table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'models'
  ) THEN
    -- Add the table to the publication
    ALTER PUBLICATION supabase_realtime ADD TABLE public.models;
  END IF;
END
$;

-- 8. Fix users table RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Public access" ON public.users;

-- Create updated policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.users FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins can update all profiles"
  ON public.users FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE));

-- Create a public access policy for easier testing
CREATE POLICY "Public access"
  ON public.users FOR SELECT
  USING (true);
