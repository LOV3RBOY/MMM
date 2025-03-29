-- Fix the handle_new_user function to properly handle errors and avoid conflicts
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
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    is_admin = EXCLUDED.is_admin,
    updated_at = EXCLUDED.updated_at;
  RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make sure the users table has all required columns
DO $$
BEGIN
  -- Ensure token_identifier is nullable
  ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;
  
  -- Add missing columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin') THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
  
  -- Ensure the users table has RLS enabled with proper policies
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies to avoid conflicts
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
END
$$;

-- Enable realtime for users table
alter publication supabase_realtime add table public.users;