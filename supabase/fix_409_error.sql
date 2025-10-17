-- Script de correction pour résoudre l'erreur 409
-- Ce script corrige les politiques RLS problématiques

-- 1. Supprimer et recréer la politique problématique pour shooting_days
DROP POLICY IF EXISTS "Users can insert shooting days" ON shooting_days;

-- 2. Créer une politique plus permissive pour l'insertion
CREATE POLICY "Users can insert shooting days"
  ON shooting_days FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. Vérifier que la table profiles peut être utilisée
-- Créer une politique pour permettre l'insertion automatique de profils
DROP POLICY IF EXISTS "Users can insert profiles" ON profiles;

CREATE POLICY "Users can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Créer une fonction pour auto-créer un profil si nécessaire
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'editor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer un trigger pour auto-créer le profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- 6. Insérer le profil pour l'utilisateur actuel s'il n'existe pas
DO $$
DECLARE
    current_user_id uuid;
    current_user_email text;
BEGIN
    -- Obtenir l'ID de l'utilisateur actuel
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        -- Obtenir l'email de l'utilisateur
        SELECT email INTO current_user_email FROM auth.users WHERE id = current_user_id;
        
        -- Insérer le profil s'il n'existe pas
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (current_user_id, current_user_email, '', 'editor')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;