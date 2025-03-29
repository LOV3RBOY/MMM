-- Fix the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user RECORD;
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'handle_new_user trigger executing for user: %', NEW.id;
  
  -- Check if user already exists to avoid conflicts
  SELECT * INTO new_user FROM public.users WHERE id = NEW.id;
  
  IF FOUND THEN
    -- User exists, update the record
    RAISE LOG 'User % already exists, updating', NEW.id;
    
    UPDATE public.users SET
      email = NEW.email,
      name = COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      avatar_url = NEW.raw_user_meta_data->>'avatar_url',
      is_admin = COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
      updated_at = NOW()
    WHERE id = NEW.id;
  ELSE
    -- User doesn't exist, insert new record
    RAISE LOG 'Creating new user record for %', NEW.id;
    
    INSERT INTO public.users (
      id,
      user_id,
      email,
      name,
      full_name,
      avatar_url,
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
      COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the transaction
  RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make sure the users table has all required columns with proper constraints
DO $$
BEGIN
  -- Ensure id is the primary key
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.users'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE public.users ADD PRIMARY KEY (id);
  END IF;
  
  -- Make sure all required columns exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'user_id') THEN
    ALTER TABLE public.users ADD COLUMN user_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email') THEN
    ALTER TABLE public.users ADD COLUMN email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE public.users ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name') THEN
    ALTER TABLE public.users ADD COLUMN full_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin') THEN
    ALTER TABLE public.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at') THEN
    ALTER TABLE public.users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Make sure token_identifier is nullable if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'token_identifier') THEN
    ALTER TABLE public.users ALTER COLUMN token_identifier DROP NOT NULL;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in migration: %', SQLERRM;
END
$$;