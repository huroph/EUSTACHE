-- Script de mise à jour pour ajouter les champs du dépouillement à la table sequences
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Table des décors (réutilisables entre séquences)
CREATE TABLE IF NOT EXISTS decors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE decors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all decors"
  ON decors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert decors"
  ON decors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update decors"
  ON decors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete decors"
  ON decors FOR DELETE
  TO authenticated
  USING (true);

-- Trigger pour updated_at sur decors
CREATE TRIGGER update_decors_updated_at
  BEFORE UPDATE ON decors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ajouter les nouveaux champs à la table sequences
-- Numéro de scène (3 parties séparées : ex: 12 / A / 2)
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS scene_part1 text;
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS scene_part2 text;
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS scene_part3 text;

-- Référence au décor
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS decor_id uuid REFERENCES decors(id) ON DELETE SET NULL;

-- Résumé de la séquence
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS resume text;

-- Équipe (MAIN UNIT, 2ND UNIT, etc.)
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS team text DEFAULT 'MAIN UNIT';

-- Plan de travail (où insérer cette séquence)
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS work_plan text;

-- Chronologie (ordre dans l'histoire)
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS chronology integer;

-- E.T.T. - Estimated Time to Take (temps de tournage estimé en minutes)
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS ett_minutes integer DEFAULT 0;

-- Pages (nombre de pages de script, format décimal ex: 0.125 pour 1/8)
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS pages_count decimal(5,3) DEFAULT 0;

-- Pré-minutage (durée estimée de la séquence montée en secondes)
ALTER TABLE sequences ADD COLUMN IF NOT EXISTS pre_timing_seconds integer DEFAULT 0;

-- Index pour optimiser les recherches
CREATE INDEX IF NOT EXISTS idx_sequences_decor ON sequences(decor_id);
CREATE INDEX IF NOT EXISTS idx_sequences_team ON sequences(team);
CREATE INDEX IF NOT EXISTS idx_sequences_chronology ON sequences(chronology);

-- Insérer quelques décors par défaut
INSERT INTO decors (name, description) VALUES
  ('Appartement Jean', 'Appartement principal du protagoniste'),
  ('Bureau', 'Bureau de travail'),
  ('Rue', 'Extérieur rue de la ville'),
  ('Voiture', 'Intérieur voiture'),
  ('Restaurant', 'Restaurant pour scène de rendez-vous')
ON CONFLICT (name) DO NOTHING;
