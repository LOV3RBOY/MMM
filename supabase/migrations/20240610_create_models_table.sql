-- Create models table if it doesn't exist
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  height TEXT NOT NULL,
  measurements TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  status TEXT NOT NULL CHECK (status IN ('Available', 'Booked', 'On Hold')),
  location TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable row level security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can CRUD models" ON models;
CREATE POLICY "Authenticated users can CRUD models"
ON models
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable realtime
alter publication supabase_realtime add table models;

-- Update the types
DO $$ BEGIN
  CREATE TYPE public.models_status_enum AS ENUM ('Available', 'Booked', 'On Hold');
  EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
