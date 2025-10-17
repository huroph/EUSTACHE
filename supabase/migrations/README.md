# 📁 Migrations Supabase - FilmBoard

## 🎯 Structure

```
supabase/migrations/
├── 20251012000000_reset.sql           # Script de nettoyage (supprime tout)
├── 20251012000000_complete_schema.sql # Migration complète (crée tout)
└── archive/                           # Anciennes migrations (historique)
```

## 🚀 Comment utiliser

### Option 1 : Migration Complète (RECOMMANDÉ)

Si vous voulez repartir de zéro avec une base propre :

1. **Exécutez d'abord** : `20251012000000_reset.sql`
   - Supprime toutes les tables, policies, triggers, etc.
   - ⚠️ ATTENTION : Supprime TOUTES les données !

2. **Puis exécutez** : `20251012000000_complete_schema.sql`
   - Recrée tout depuis zéro
   - Tables + RLS + Policies + Storage
   - Pré-remplit les 12 catégories de dépouillement

### Option 2 : Nouvelle Installation

Si c'est une nouvelle base de données vide :

1. **Exécutez seulement** : `20251012000000_complete_schema.sql`
   - Pas besoin de reset si la base est vide

## 📋 Ce qui est créé

### Tables (11)
1. `profiles` - Profils utilisateurs (extension de auth.users)
2. `projects` - Projets de film
3. `shooting_days` - Jours de tournage
4. `departments` - Départements de production
5. `decors` - Décors
6. `sequences` - Séquences à tourner
7. `sequence_departments` - Liaison séquence ↔ département
8. `depouillement_categories` - Catégories de dépouillement (12 pré-remplies)
9. `depouillement_items` - Éléments de dépouillement
10. `sequence_depouillement` - Liaison séquence ↔ éléments
11. (+ 1 bucket Storage) `scenarios` - Upload de scénarios PDF

### Sécurité
- ✅ RLS (Row Level Security) activé sur toutes les tables
- ✅ 28 policies pour isoler les données par utilisateur
- ✅ Cascade deletes pour maintenir l'intégrité
- ✅ Policies Storage pour les fichiers

### Performance
- ✅ 13 index sur les colonnes fréquemment requêtées
- ✅ 5 triggers pour `updated_at` automatique

## 🔍 Détails du schéma

### Hiérarchie des données

```
User (auth.users)
  └─ Profile
  └─ Projects (1..*)
      ├─ Shooting Days (1..*)
      │   └─ Sequences (1..*)
      │       ├─ Sequence Departments (0..*)
      │       └─ Sequence Depouillement (0..*)
      └─ Decors (0..*)

Departments (partagés entre tous les users)
Depouillement Categories (partagés, pré-remplis)
  └─ Depouillement Items (0..*)
```

### Colonnes importantes

#### `sequences` table
- `project_id` : UUID (référence à projects)
- `shooting_day_id` : UUID (référence à shooting_days)
- `ett_minutes` : INTEGER (durée estimée en minutes) ⚠️ NOM CORRECT
- `scene_part1`, `scene_part2`, `scene_part3` : Numérotation de scène
- `decor_id` : UUID (référence à decors)
- Et 20+ autres colonnes...

#### `projects` table
- `user_id` : UUID (référence à auth.users)
- `title` : TEXT
- `scenario_file` : TEXT (chemin dans Storage)
- `start_date`, `end_date` : DATE

## 📦 Archive

Le dossier `archive/` contient les anciennes migrations utilisées pendant le développement :
- `20251011133627_create_filmboard_schema.sql` - Première version (partielle)
- `20251011140000_create_projects_table.sql` - Ajout de la table projects
- `20251011141000_create_storage_bucket.sql` - Ajout du bucket Storage

Ces fichiers sont conservés pour l'historique mais ne doivent plus être utilisés.

## 🐛 Dépannage

### Erreur "table already exists"
→ La table existe déjà. Utilisez `20251012000000_reset.sql` pour nettoyer d'abord.

### Erreur "policy already exists"
→ La policy existe déjà. Utilisez `20251012000000_reset.sql` pour nettoyer d'abord.

### Erreur "column ett_minutes not found"
→ Vous utilisez une ancienne migration. Utilisez `20251012000000_complete_schema.sql`.

### Erreur "column project_id not found"
→ Vous utilisez une ancienne migration. Utilisez `20251012000000_complete_schema.sql`.

## 📚 Documentation

Pour plus de détails, consultez :
- `GUIDE_MIGRATION_PROPRE.md` (à la racine) - Guide pas-à-pas
- `ARCHITECTURE.md` (à la racine) - Architecture complète
- `SUPABASE_STRATEGY.md` (à la racine) - Stratégie DEV/PROD

## ✅ Checklist après migration

- [ ] 11 tables visibles dans Table Editor
- [ ] Table `sequences` a la colonne `ett_minutes`
- [ ] Table `sequences` a la colonne `project_id`
- [ ] Bucket `scenarios` visible dans Storage
- [ ] Table `depouillement_categories` a 12 lignes
- [ ] Application fonctionne sans erreur 400/404/401

## 🎉 C'est tout !

Si vous avez des questions ou des problèmes, référez-vous au `GUIDE_MIGRATION_PROPRE.md`.
