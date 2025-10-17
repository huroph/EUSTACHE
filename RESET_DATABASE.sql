-- ====================================================================
-- 🗑️  SUPPRESSION COMPLÈTE DE LA BASE DE DONNÉES
-- ⚠️  ATTENTION: CECI SUPPRIME TOUTES LES DONNÉES !
-- À exécuter dans Supabase SQL Editor du projet PROD
-- ====================================================================

-- 1. Supprimer le bucket storage (d'abord les objets, puis le bucket)
DELETE FROM storage.objects WHERE bucket_id = 'scenarios';
DELETE FROM storage.buckets WHERE id = 'scenarios';

-- 2. Supprimer les politiques RLS
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view project shooting days" ON shooting_days;
DROP POLICY IF EXISTS "Users can insert project shooting days" ON shooting_days;
DROP POLICY IF EXISTS "Users can update project shooting days" ON shooting_days;
DROP POLICY IF EXISTS "Users can delete project shooting days" ON shooting_days;

DROP POLICY IF EXISTS "Users can view departments" ON departments;
DROP POLICY IF EXISTS "Users can insert departments" ON departments;
DROP POLICY IF EXISTS "Users can update departments" ON departments;
DROP POLICY IF EXISTS "Users can delete departments" ON departments;

DROP POLICY IF EXISTS "Users can view project decors" ON decors;
DROP POLICY IF EXISTS "Users can insert project decors" ON decors;
DROP POLICY IF EXISTS "Users can update project decors" ON decors;
DROP POLICY IF EXISTS "Users can delete project decors" ON decors;

DROP POLICY IF EXISTS "Users can view project sequences" ON sequences;
DROP POLICY IF EXISTS "Users can insert project sequences" ON sequences;
DROP POLICY IF EXISTS "Users can update project sequences" ON sequences;
DROP POLICY IF EXISTS "Users can delete project sequences" ON sequences;

DROP POLICY IF EXISTS "Users can view sequence departments" ON sequence_departments;
DROP POLICY IF EXISTS "Users can insert sequence departments" ON sequence_departments;
DROP POLICY IF EXISTS "Users can update sequence departments" ON sequence_departments;
DROP POLICY IF EXISTS "Users can delete sequence departments" ON sequence_departments;

DROP POLICY IF EXISTS "Users can view categories" ON depouillement_categories;
DROP POLICY IF EXISTS "Users can view items" ON depouillement_items;
DROP POLICY IF EXISTS "Users can insert items" ON depouillement_items;
DROP POLICY IF EXISTS "Users can update items" ON depouillement_items;
DROP POLICY IF EXISTS "Users can delete items" ON depouillement_items;

DROP POLICY IF EXISTS "Users can view sequence depouillement" ON sequence_depouillement;
DROP POLICY IF EXISTS "Users can insert sequence depouillement" ON sequence_depouillement;
DROP POLICY IF EXISTS "Users can update sequence depouillement" ON sequence_depouillement;
DROP POLICY IF EXISTS "Users can delete sequence depouillement" ON sequence_depouillement;

-- 3. Supprimer les triggers
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_shooting_days_updated_at ON shooting_days;
DROP TRIGGER IF EXISTS update_sequences_updated_at ON sequences;
DROP TRIGGER IF EXISTS update_decors_updated_at ON decors;
DROP TRIGGER IF EXISTS update_depouillement_items_updated_at ON depouillement_items;

-- 4. Supprimer les fonctions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_new_user();

-- Supprimer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 5. Supprimer les index
DROP INDEX IF EXISTS idx_projects_user_id;
DROP INDEX IF EXISTS idx_shooting_days_project_id;
DROP INDEX IF EXISTS idx_shooting_days_date;
DROP INDEX IF EXISTS idx_sequences_project_id;
DROP INDEX IF EXISTS idx_sequences_shooting_day;
DROP INDEX IF EXISTS idx_sequences_status;
DROP INDEX IF EXISTS idx_decors_project_id;
DROP INDEX IF EXISTS idx_sequence_departments_sequence;
DROP INDEX IF EXISTS idx_sequence_departments_department;
DROP INDEX IF EXISTS idx_depouillement_items_category;
DROP INDEX IF EXISTS idx_sequence_depouillement_sequence;
DROP INDEX IF EXISTS idx_sequence_depouillement_item;

-- 6. Supprimer les tables (ordre inverse des dépendances)
DROP TABLE IF EXISTS sequence_depouillement CASCADE;
DROP TABLE IF EXISTS depouillement_items CASCADE;
DROP TABLE IF EXISTS depouillement_categories CASCADE;
DROP TABLE IF EXISTS sequence_departments CASCADE;
DROP TABLE IF EXISTS sequences CASCADE;
DROP TABLE IF EXISTS decors CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS shooting_days CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ====================================================================
-- ✅ Base de données complètement nettoyée !
-- Maintenant exécutez MIGRATION_COMPLETE.sql
-- ====================================================================
