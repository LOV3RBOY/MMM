-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  height TEXT NOT NULL,
  measurements TEXT NOT NULL,
  age INTEGER NOT NULL,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  specialties TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to select models
DROP POLICY IF EXISTS "Allow authenticated users to select models" ON models;
CREATE POLICY "Allow authenticated users to select models"
  ON models FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert models
DROP POLICY IF EXISTS "Allow authenticated users to insert models" ON models;
CREATE POLICY "Allow authenticated users to insert models"
  ON models FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update models
DROP POLICY IF EXISTS "Allow authenticated users to update models" ON models;
CREATE POLICY "Allow authenticated users to update models"
  ON models FOR UPDATE
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to delete models
DROP POLICY IF EXISTS "Allow authenticated users to delete models" ON models;
CREATE POLICY "Allow authenticated users to delete models"
  ON models FOR DELETE
  TO authenticated
  USING (true);

-- Enable realtime for models table
alter publication supabase_realtime add table models;
