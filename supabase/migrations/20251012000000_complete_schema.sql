-- ====================================================================
-- 🎬 FILMBOARD - MIGRATION COMPLÈTE ET PROPRE
-- Version: 2.0 - Recréation complète depuis zéro
-- Date: 12 octobre 2025
-- ====================================================================
-- 
-- COMMENT UTILISER CE FICHIER :
-- 1. Exécutez d'abord RESET_DATABASE.sql pour nettoyer
-- 2. Puis exécutez ce fichier pour recréer tout proprement
-- 3. Vérifiez dans Table Editor que toutes les tables existent
-- 
-- ====================================================================

-- ====================================================================
-- ÉTAPE 1 : FONCTION UTILITAIRE (updated_at automatique)
-- ====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- ÉTAPE 2 : TABLE profiles (extension de auth.users)
-- ====================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'editor'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après chaque création de compte
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ====================================================================
-- ÉTAPE 3 : TABLE projects (projets de film)
-- ====================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  scenario_file TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_projects_user_id ON projects(user_id);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ====================================================================
-- ÉTAPE 4 : TABLE shooting_days (jours de tournage)
-- ====================================================================

CREATE TABLE shooting_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  location_global TEXT,
  weather_forecast TEXT,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shooting_days ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_shooting_days_project_id ON shooting_days(project_id);
CREATE INDEX idx_shooting_days_date ON shooting_days(date);

CREATE TRIGGER update_shooting_days_updated_at
  BEFORE UPDATE ON shooting_days
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour shooting_days
CREATE POLICY "Users can view project shooting days"
  ON shooting_days FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shooting_days.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert project shooting days"
  ON shooting_days FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shooting_days.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project shooting days"
  ON shooting_days FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shooting_days.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete project shooting days"
  ON shooting_days FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = shooting_days.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ====================================================================
-- ÉTAPE 5 : TABLE departments (départements de production)
-- ====================================================================

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  head_of_department TEXT,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour departments (accès global pour tous les utilisateurs authentifiés)
CREATE POLICY "Users can view departments"
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

-- ====================================================================
-- ÉTAPE 6 : TABLE decors (décors)
-- ====================================================================

CREATE TABLE decors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE decors ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_decors_project_id ON decors(project_id);

CREATE TRIGGER update_decors_updated_at
  BEFORE UPDATE ON decors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour decors
CREATE POLICY "Users can view project decors"
  ON decors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = decors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert project decors"
  ON decors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = decors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project decors"
  ON decors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = decors.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete project decors"
  ON decors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = decors.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ====================================================================
-- ÉTAPE 7 : TABLE sequences (séquences de tournage)
-- ====================================================================

CREATE TABLE sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  shooting_day_id UUID REFERENCES shooting_days(id) ON DELETE SET NULL,
  sequence_number TEXT NOT NULL,
  scene_part1 TEXT,
  scene_part2 TEXT,
  scene_part3 TEXT,
  decor_id UUID REFERENCES decors(id) ON DELETE SET NULL,
  int_ext TEXT CHECK (int_ext IN ('INT', 'EXT')),
  day_night TEXT CHECK (day_night IN ('Jour', 'Nuit')),
  effect TEXT,
  main_decor TEXT,
  sub_decor TEXT,
  physical_location TEXT,
  resume TEXT,
  team TEXT DEFAULT '',
  work_plan TEXT,
  chronology INTEGER,
  ett_minutes INTEGER DEFAULT 0,
  pages_count INTEGER DEFAULT 0,
  pre_timing_seconds INTEGER DEFAULT 0,
  start_time TIME,
  end_time TIME,
  estimated_duration INTEGER DEFAULT 0,
  characters JSONB DEFAULT '[]'::jsonb,
  authorizations JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'to_prepare' CHECK (status IN ('to_prepare', 'in_progress', 'completed')),
  notes_ad TEXT,
  order_in_day INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sequences ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sequences_project_id ON sequences(project_id);
CREATE INDEX idx_sequences_shooting_day ON sequences(shooting_day_id);
CREATE INDEX idx_sequences_status ON sequences(status);

CREATE TRIGGER update_sequences_updated_at
  BEFORE UPDATE ON sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour sequences
CREATE POLICY "Users can view project sequences"
  ON sequences FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sequences.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert project sequences"
  ON sequences FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sequences.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project sequences"
  ON sequences FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sequences.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete project sequences"
  ON sequences FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = sequences.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ====================================================================
-- ÉTAPE 8 : TABLE sequence_departments (liaison séquence-département)
-- ====================================================================

CREATE TABLE sequence_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  needs TEXT,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, department_id)
);

ALTER TABLE sequence_departments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sequence_departments_sequence ON sequence_departments(sequence_id);
CREATE INDEX idx_sequence_departments_department ON sequence_departments(department_id);

-- RLS Policies pour sequence_departments
CREATE POLICY "Users can view sequence departments"
  ON sequence_departments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_departments.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sequence departments"
  ON sequence_departments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_departments.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sequence departments"
  ON sequence_departments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_departments.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sequence departments"
  ON sequence_departments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_departments.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

-- ====================================================================
-- ÉTAPE 9 : TABLE depouillement_categories (catégories de dépouillement)
-- ====================================================================

CREATE TABLE depouillement_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#6B7280',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE depouillement_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies pour depouillement_categories (lecture seule pour tous)
CREATE POLICY "Users can view categories"
  ON depouillement_categories FOR SELECT
  TO authenticated
  USING (true);

-- Pré-remplir avec les 12 catégories standards
INSERT INTO depouillement_categories (name, icon, color, order_index) VALUES
  ('Rôles', '👤', '#EF4444', 0),
  ('Silhouettes & Doublures Image', '👥', '#F97316', 1),
  ('Figuration', '🎭', '#F59E0B', 2),
  ('Cascadeurs & Doublures Cascade', '🤸', '#EAB308', 3),
  ('Conseillers Techniques', '🎓', '#84CC16', 4),
  ('Cascades & Effets Spéciaux', '💥', '#22C55E', 5),
  ('Effets Visuels (VFX)', '✨', '#10B981', 6),
  ('Maquillage & Coiffure', '💄', '#14B8A6', 7),
  ('Costumes', '👔', '#06B6D4', 8),
  ('Accessoires', '🎪', '#0EA5E9', 9),
  ('Véhicules & Transport', '🚗', '#3B82F6', 10),
  ('Animaux', '🐾', '#6366F1', 11);

-- ====================================================================
-- ÉTAPE 10 : TABLE depouillement_items (éléments de dépouillement)
-- ====================================================================

CREATE TABLE depouillement_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES depouillement_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE depouillement_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_depouillement_items_category ON depouillement_items(category_id);

CREATE TRIGGER update_depouillement_items_updated_at
  BEFORE UPDATE ON depouillement_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour depouillement_items
CREATE POLICY "Users can view items"
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

-- ====================================================================
-- ÉTAPE 11 : TABLE sequence_depouillement (liaison séquence-items)
-- ====================================================================

CREATE TABLE sequence_depouillement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES depouillement_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, item_id)
);

ALTER TABLE sequence_depouillement ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sequence_depouillement_sequence ON sequence_depouillement(sequence_id);
CREATE INDEX idx_sequence_depouillement_item ON sequence_depouillement(item_id);

-- RLS Policies pour sequence_depouillement
CREATE POLICY "Users can view sequence depouillement"
  ON sequence_depouillement FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_depouillement.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sequence depouillement"
  ON sequence_depouillement FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_depouillement.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sequence depouillement"
  ON sequence_depouillement FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_depouillement.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete sequence depouillement"
  ON sequence_depouillement FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sequences
      JOIN projects ON projects.id = sequences.project_id
      WHERE sequences.id = sequence_depouillement.sequence_id
      AND projects.user_id = auth.uid()
    )
  );

-- ====================================================================
-- ÉTAPE 12 : STORAGE BUCKET (pour les scénarios PDF)
-- ====================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('scenarios', 'scenarios', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies pour le bucket scenarios
DROP POLICY IF EXISTS "Users can view own scenarios" ON storage.objects;
CREATE POLICY "Users can view own scenarios"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'scenarios' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload own scenarios" ON storage.objects;
CREATE POLICY "Users can upload own scenarios"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'scenarios' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own scenarios" ON storage.objects;
CREATE POLICY "Users can update own scenarios"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'scenarios' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own scenarios" ON storage.objects;
CREATE POLICY "Users can delete own scenarios"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'scenarios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ====================================================================
-- ✅ MIGRATION COMPLÈTE TERMINÉE !
-- ====================================================================
-- 
-- Tables créées : 11
-- - profiles
-- - projects
-- - shooting_days
-- - departments
-- - decors
-- - sequences
-- - sequence_departments
-- - depouillement_categories (avec 12 catégories pré-remplies)
-- - depouillement_items
-- - sequence_depouillement
-- 
-- Storage : 1 bucket
-- - scenarios
-- 
-- Sécurité : Toutes les tables ont RLS activé avec policies appropriées
-- 
-- Vérifiez dans Table Editor que tout est bien là !
-- ====================================================================
