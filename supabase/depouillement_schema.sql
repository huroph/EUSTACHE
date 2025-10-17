-- Script pour ajouter le système de dépouillement complet
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Table des catégories de dépouillement
CREATE TABLE IF NOT EXISTS depouillement_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text,
  color text DEFAULT '#6B7280',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE depouillement_categories ENABLE ROW LEVEL SECURITY;

-- Table des éléments de dépouillement
CREATE TABLE IF NOT EXISTS depouillement_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES depouillement_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE depouillement_items ENABLE ROW LEVEL SECURITY;

-- Table de liaison entre séquences et éléments de dépouillement
CREATE TABLE IF NOT EXISTS sequence_depouillement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid REFERENCES sequences(id) ON DELETE CASCADE,
  item_id uuid REFERENCES depouillement_items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sequence_id, item_id)
);

ALTER TABLE sequence_depouillement ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_depouillement_items_category ON depouillement_items(category_id);
CREATE INDEX IF NOT EXISTS idx_sequence_depouillement_sequence ON sequence_depouillement(sequence_id);
CREATE INDEX IF NOT EXISTS idx_sequence_depouillement_item ON sequence_depouillement(item_id);

-- RLS Policies pour depouillement_categories
CREATE POLICY "Users can view all categories"
  ON depouillement_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert categories"
  ON depouillement_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update categories"
  ON depouillement_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete categories"
  ON depouillement_categories FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies pour depouillement_items
CREATE POLICY "Users can view all items"
  ON depouillement_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert items"
  ON depouillement_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update items"
  ON depouillement_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete items"
  ON depouillement_items FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies pour sequence_depouillement
CREATE POLICY "Users can view all sequence depouillement"
  ON sequence_depouillement FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sequence depouillement"
  ON sequence_depouillement FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sequence depouillement"
  ON sequence_depouillement FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sequence depouillement"
  ON sequence_depouillement FOR DELETE
  TO authenticated
  USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_depouillement_items_updated_at
  BEFORE UPDATE ON depouillement_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer les catégories par défaut
INSERT INTO depouillement_categories (name, icon, color, order_index) VALUES
  ('Général', '⚙️', '#6B7280', 0),
  ('Rôles', '🎭', '#8B5CF6', 1),
  ('Silhouettes', '👤', '#EC4899', 2),
  ('Figurations', '👥', '#F59E0B', 3),
  ('Cascadeurs', '🤸', '#EF4444', 4),
  ('Décors', '🏛️', '#10B981', 5),
  ('Véhicules', '🚗', '#3B82F6', 6),
  ('Costumes', '👔', '#EC4899', 7),
  ('Maquillage', '💄', '#F59E0B', 8),
  ('Caméra', '🎥', '#6366F1', 9),
  ('Machinerie', '🎬', '#3B82F6', 10),
  ('Électricité', '💡', '#EAB308', 11)
ON CONFLICT (name) DO NOTHING;
