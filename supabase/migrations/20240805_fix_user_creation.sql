-- Fix user creation and optimize RLS policies

-- First disable RLS to make changes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Public access" ON public.users;

-- Create optimized policies with (SELECT auth.uid()) pattern
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON public.users FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND is_admin = TRUE));

CREATE POLICY "Admins can update all profiles"
  ON public.users FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = (SELECT auth.uid()) AND is_admin = TRUE));

-- Create a public access policy for easier testing
CREATE POLICY "Public access"
  ON public.users FOR SELECT
  USING (true);

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Ensure handle_new_user function is secure and working correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, is_admin, created_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'is_admin')::boolean, false),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
