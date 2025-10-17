-- Script de nettoyage et recréation pour FilmBoard
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Supprimer les politiques RLS existantes
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all shooting days" ON shooting_days;
DROP POLICY IF EXISTS "Users can insert shooting days" ON shooting_days;
DROP POLICY IF EXISTS "Users can update shooting days" ON shooting_days;
DROP POLICY IF EXISTS "Users can delete shooting days" ON shooting_days;
DROP POLICY IF EXISTS "Users can view all departments" ON departments;
DROP POLICY IF EXISTS "Users can insert departments" ON departments;
DROP POLICY IF EXISTS "Users can update departments" ON departments;
DROP POLICY IF EXISTS "Users can delete departments" ON departments;
DROP POLICY IF EXISTS "Users can view all sequences" ON sequences;
DROP POLICY IF EXISTS "Users can insert sequences" ON sequences;
DROP POLICY IF EXISTS "Users can update sequences" ON sequences;
DROP POLICY IF EXISTS "Users can delete sequences" ON sequences;
DROP POLICY IF EXISTS "Users can view all sequence departments" ON sequence_departments;
DROP POLICY IF EXISTS "Users can insert sequence departments" ON sequence_departments;
DROP POLICY IF EXISTS "Users can update sequence departments" ON sequence_departments;
DROP POLICY IF EXISTS "Users can delete sequence departments" ON sequence_departments;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS update_shooting_days_updated_at ON shooting_days;
DROP TRIGGER IF EXISTS update_sequences_updated_at ON sequences;

-- Supprimer la fonction
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Supprimer les indexes
DROP INDEX IF EXISTS idx_sequences_shooting_day;
DROP INDEX IF EXISTS idx_sequences_status;
DROP INDEX IF EXISTS idx_shooting_days_date;
DROP INDEX IF EXISTS idx_sequence_departments_sequence;
DROP INDEX IF EXISTS idx_sequence_departments_department;

-- Supprimer les tables (dans l'ordre inverse des dépendances)
DROP TABLE IF EXISTS sequence_departments CASCADE;
DROP TABLE IF EXISTS sequences CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS shooting_days CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Maintenant, recréer tout le schéma
-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create shooting_days table
CREATE TABLE shooting_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL,
  date date NOT NULL,
  location_global text,
  weather_forecast text,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shooting_days ENABLE ROW LEVEL SECURITY;

-- Create departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  head_of_department text,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create sequences table
CREATE TABLE sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shooting_day_id uuid REFERENCES shooting_days(id) ON DELETE CASCADE,
  sequence_number text NOT NULL,
  int_ext text CHECK (int_ext IN ('INT', 'EXT')),
  day_night text CHECK (day_night IN ('Jour', 'Nuit')),
  effect text,
  main_decor text,
  sub_decor text,
  physical_location text,
  start_time time,
  end_time time,
  estimated_duration integer DEFAULT 0,
  characters jsonb DEFAULT '[]'::jsonb,
  authorizations jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'to_prepare' CHECK (status IN ('to_prepare', 'in_progress', 'completed')),
  notes_ad text,
  order_in_day integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;

-- Create sequence_departments junction table
CREATE TABLE sequence_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES sequences(id) ON DELETE CASCADE,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  needs text,
  is_validated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sequence_id, department_id)
);

ALTER TABLE sequence_departments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_sequences_shooting_day ON sequences(shooting_day_id);
CREATE INDEX idx_sequences_status ON sequences(status);
CREATE INDEX idx_shooting_days_date ON shooting_days(date);
CREATE INDEX idx_sequence_departments_sequence ON sequence_departments(sequence_id);
CREATE INDEX idx_sequence_departments_department ON sequence_departments(department_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for shooting_days
CREATE POLICY "Users can view all shooting days"
  ON shooting_days FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert shooting days"
  ON shooting_days FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update shooting days"
  ON shooting_days FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete shooting days"
  ON shooting_days FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for departments
CREATE POLICY "Users can view all departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sequences
CREATE POLICY "Users can view all sequences"
  ON sequences FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sequences"
  ON sequences FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sequences"
  ON sequences FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sequences"
  ON sequences FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sequence_departments
CREATE POLICY "Users can view all sequence departments"
  ON sequence_departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sequence departments"
  ON sequence_departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sequence departments"
  ON sequence_departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sequence departments"
  ON sequence_departments FOR DELETE
  TO authenticated
  USING (true);

-- Insert default departments
INSERT INTO departments (name, head_of_department, color) VALUES
  ('Décoration', '', '#8B5CF6'),
  ('Costumes', '', '#EC4899'),
  ('Maquillage', '', '#F59E0B'),
  ('Régie', '', '#10B981'),
  ('Machinerie', '', '#3B82F6'),
  ('Lumière', '', '#EAB308'),
  ('Son', '', '#06B6D4'),
  ('Cascade', '', '#EF4444');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_shooting_days_updated_at
  BEFORE UPDATE ON shooting_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequences_updated_at
  BEFORE UPDATE ON sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();