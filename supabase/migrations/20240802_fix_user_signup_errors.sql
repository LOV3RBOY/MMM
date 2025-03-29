-- Add missing columns to users table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE public.users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END$$;

-- Make sure RLS is disabled for easier testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Create a public access policy for easier testing
DROP POLICY IF EXISTS "Public access" ON public.users;
CREATE POLICY "Public access"
  ON public.users FOR SELECT
  USING (true);
