# 🎬 FilmBoard - Récapitulatif Migration Propre

> **Date** : 12 octobre 2025  
> **Version** : 2.0 - Reconstruction complète  
> **Statut** : ✅ Prêt à exécuter

---

## 📊 Situation

### ❌ Problèmes rencontrés (avant)
1. Colonne `estimated_duration` au lieu de `ett_minutes` → Erreurs 400
2. Manque `project_id` sur certaines tables → Impossible de filtrer par projet
3. Policies RLS dupliquées → Erreurs "policy already exists"
4. Migrations fragmentées → Confusion et état incohérent
5. Tables manquantes (decors, depouillement) → Erreurs 404

### ✅ Solution (maintenant)
- **2 fichiers SQL propres** : Un pour nettoyer, un pour recréer
- **Migration complète** : Toutes les tables + RLS + Storage
- **Cohérence code/DB** : Utilise `ett_minutes` comme le code TypeScript
- **Multi-projets** : `project_id` partout où nécessaire
- **12 catégories** : Pré-remplies automatiquement

---

## 📁 Fichiers créés

| Fichier | Description | Utilisation |
|---------|-------------|-------------|
| **`RESET_DATABASE.sql`** | Supprime tout (tables, policies, triggers) | Étape 1 : Nettoyer |
| **`MIGRATION_COMPLETE.sql`** | Recrée tout depuis zéro | Étape 2 : Installer |
| **`GUIDE_MIGRATION_PROPRE.md`** | Guide pas-à-pas illustré | Lire avant d'exécuter |
| **`supabase/migrations/README.md`** | Documentation technique | Référence |

---

## 🚀 Comment procéder

### Option 1 : Je veux suivre le guide détaillé

→ Ouvrez **`GUIDE_MIGRATION_PROPRE.md`** et suivez les étapes avec captures

### Option 2 : Je sais ce que je fais (rapide)

1. Allez sur : https://supabase.com/dashboard/project/xkwnnrhzlozhpgplxhmb/sql/new

2. **Étape 1 - Nettoyer** :
   ```
   Copiez tout le contenu de RESET_DATABASE.sql → Collez → Run
   ```

3. **Étape 2 - Recréer** :
   ```
   Copiez tout le contenu de MIGRATION_COMPLETE.sql → Collez → Run
   ```

4. **Vérifier** :
   - Table Editor : 11 tables visibles ✅
   - Storage : 1 bucket "scenarios" ✅
   - `depouillement_categories` : 12 lignes ✅

5. **Tester l'app** :
   - https://film-board-7j60ezob9-hugo-nahmias-projects.vercel.app
   - Créer compte → Créer projet → Créer séquence ✅

---

## 📦 Ce qui est créé

### 11 Tables

```
profiles                    → Profils utilisateurs
  └─ projects              → Projets de film
      ├─ shooting_days     → Jours de tournage
      │   └─ sequences     → Séquences à tourner
      │       ├─ sequence_departments
      │       └─ sequence_depouillement
      └─ decors            → Décors du film

departments                → Départements (global)
depouillement_categories   → Catégories (12 pré-remplies)
  └─ depouillement_items   → Éléments de dépouillement
```

### 1 Bucket Storage
- `scenarios` : Pour upload de scénarios PDF

### Sécurité
- **RLS activé** sur toutes les tables
- **28 policies** pour isoler les données par user
- **Storage policies** pour les fichiers privés

### Performance
- **13 index** pour optimiser les requêtes
- **5 triggers** pour `updated_at` automatique

---

## 🔍 Détails techniques clés

### Colonne `ett_minutes` ✅
```sql
-- Dans la table sequences
ett_minutes INTEGER DEFAULT 0
```
→ Votre code utilise `ett_minutes` partout, maintenant la DB aussi !

### Colonne `project_id` ✅
```sql
-- Ajoutée sur 3 tables
sequences.project_id      → UUID REFERENCES projects(id)
shooting_days.project_id  → UUID REFERENCES projects(id)
decors.project_id         → UUID REFERENCES projects(id)
```
→ Isolation parfaite des données par projet

### 12 Catégories pré-remplies ✅
```
Rôles, Silhouettes & Doublures Image, Figuration, Cascadeurs,
Conseillers Techniques, Cascades & Effets Spéciaux, VFX,
Maquillage & Coiffure, Costumes, Accessoires, Véhicules, Animaux
```
→ Prêtes à l'emploi dès l'installation

---

## ⚙️ Architecture base de données

### Schéma de sécurité RLS

```sql
-- Exemple pour sequences
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
```

→ Un user ne voit QUE ses propres projets et séquences

### Cascade Deletes

```
User deleted → Profile deleted
Project deleted → Shooting Days + Sequences + Decors deleted
Shooting Day deleted → Sequences mis à NULL (pas supprimées)
Sequence deleted → Sequence Departments + Depouillement deleted
```

→ Intégrité référentielle garantie

---

## 🧹 Nettoyage effectué

### Fichiers supprimés (obsolètes)
- ❌ `FIX_ETT_MINUTES.sql`
- ❌ `MIGRATION_FINALE_COMPLETE.sql`
- ❌ `MIGRATION_SUITE.sql`
- ❌ `MIGRATION_TABLES_MANQUANTES.sql`
- ❌ Tous les guides EXECUTER_*.md

### Fichiers conservés (nouveaux)
- ✅ `RESET_DATABASE.sql` (nettoyer)
- ✅ `MIGRATION_COMPLETE.sql` (installer)
- ✅ `GUIDE_MIGRATION_PROPRE.md` (guide)

### Anciennes migrations archivées
```
supabase/migrations/archive/
├── 20251011133627_create_filmboard_schema.sql
├── 20251011140000_create_projects_table.sql
└── 20251011141000_create_storage_bucket.sql
```
→ Conservées pour l'historique, mais à ne plus utiliser

---

## 🎯 Différences avec anciennes migrations

| Aspect | Ancienne migration | Nouvelle migration |
|--------|-------------------|-------------------|
| **Colonne durée** | `estimated_duration` ❌ | `ett_minutes` ✅ |
| **Project ID** | Manquant sur decors ❌ | Sur 3 tables ✅ |
| **Catégories** | Vides ❌ | 12 pré-remplies ✅ |
| **Policies** | Dupliquées ❌ | Propres avec DROP IF EXISTS ✅ |
| **Storage** | Fichier séparé ❌ | Inclus dans migration ✅ |
| **État** | Fragmenté ❌ | Complet en 1 fichier ✅ |

---

## ✅ Checklist de validation

Après avoir exécuté la migration, vérifiez :

### Dans Supabase Dashboard

- [ ] **Table Editor** : 11 tables visibles
  - [ ] `profiles`
  - [ ] `projects`
  - [ ] `shooting_days`
  - [ ] `departments`
  - [ ] `decors`
  - [ ] `sequences`
  - [ ] `sequence_departments`
  - [ ] `depouillement_categories`
  - [ ] `depouillement_items`
  - [ ] `sequence_depouillement`

- [ ] **Table `sequences`** :
  - [ ] Colonne `ett_minutes` existe (INTEGER)
  - [ ] Colonne `project_id` existe (UUID)
  - [ ] Colonne `scene_part1`, `scene_part2`, `scene_part3` existent

- [ ] **Table `depouillement_categories`** :
  - [ ] 12 lignes présentes
  - [ ] Colonnes : name, icon, color, order_index

- [ ] **Storage** :
  - [ ] Bucket `scenarios` visible
  - [ ] Bucket est privé (public = false)

### Dans votre application

- [ ] **Créer un compte** : fonctionne sans erreur 401
- [ ] **Créer un projet** : fonctionne sans erreur 400
- [ ] **Créer un jour de tournage** : fonctionne
- [ ] **Créer une séquence** : fonctionne sans erreur "ett_minutes not found"
- [ ] **Ajouter des éléments de dépouillement** : les 12 catégories apparaissent
- [ ] **Upload PDF scénario** : fonctionne (Storage)

---

## 🐛 Dépannage

### Erreur : "table already exists"
→ Exécutez d'abord `RESET_DATABASE.sql` pour nettoyer

### Erreur : "policy already exists"
→ Exécutez d'abord `RESET_DATABASE.sql` pour nettoyer

### Erreur : "Could not find the 'ett_minutes' column"
→ Vérifiez que vous avez bien exécuté `MIGRATION_COMPLETE.sql` (pas une ancienne migration)

### Erreur 400 lors de création de séquence
→ Vérifiez que la colonne `project_id` existe sur la table `sequences`

### Les catégories de dépouillement sont vides
→ Re-exécutez `MIGRATION_COMPLETE.sql`, la section INSERT INTO depouillement_categories devrait les créer

### Le bucket Storage n'apparaît pas
→ Vérifiez la section Storage dans Supabase Dashboard, le bucket `scenarios` devrait être là

---

## 📚 Documentation complète

Pour plus de détails, consultez :

| Fichier | Contenu |
|---------|---------|
| **GUIDE_MIGRATION_PROPRE.md** | Guide pas-à-pas avec explications détaillées |
| **supabase/migrations/README.md** | Documentation technique des migrations |
| **ARCHITECTURE.md** | Architecture complète de l'application |
| **SUPABASE_STRATEGY.md** | Stratégie environnements DEV/PROD |
| **SECURITY.md** | Détails sur Row Level Security |

---

## 🎉 Résumé

Vous avez maintenant :
- ✅ **2 fichiers SQL** clairs et documentés
- ✅ **Base de données propre** à recréer from scratch
- ✅ **Cohérence parfaite** entre code TypeScript et schéma DB
- ✅ **Sécurité** : RLS + Policies + Storage
- ✅ **Performance** : Index + Triggers
- ✅ **Multi-projets** : Isolation des données
- ✅ **Prêt à l'emploi** : Catégories pré-remplies

**Prochaine étape** : Ouvrez `GUIDE_MIGRATION_PROPRE.md` et suivez les instructions ! 🚀

---

*Migration créée le 12 octobre 2025 par analyse complète du code source*
