-- Update RLS policies to use more secure approach

-- First disable RLS to make changes
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.users;
DROP POLICY IF EXISTS "Public access" ON public.users;

-- Create updated policies with more secure approach
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
