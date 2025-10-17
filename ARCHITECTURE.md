# Structure Projet FilmBoard

## Vue d'ensemble

L'application FilmBoard est maintenant organisée autour d'une structure multi-projets permettant à un utilisateur de gérer plusieurs films/productions.

## Architecture

```
Authentification
    ↓
Liste des Projets (ProjectList)
    ↓
Dashboard Projet (ProjectDashboard)
    ├── Kanban Board (Plan de travail)
    └── Dépouillement (Gestion des séquences)
```

## Base de données

### Table `projects`
Table principale contenant les informations de chaque projet :
- `id` : UUID unique
- `user_id` : Référence à l'utilisateur propriétaire
- `title` : Titre du projet (obligatoire)
- `scenario_file` : Chemin ou URL vers le fichier scénario
- `start_date` : Date de début du tournage
- `end_date` : Date de fin du tournage
- `created_at` / `updated_at` : Timestamps

### Relations
Toutes les tables principales ont maintenant un `project_id` :
- `sequences` : Les séquences appartiennent à un projet
- `shooting_days` : Les jours de tournage appartiennent à un projet
- `decors` : Les décors appartiennent à un projet

### RLS (Row Level Security)
- Chaque utilisateur ne peut voir que ses propres projets
- Les données (séquences, jours, décors) sont filtrées par projet appartenant à l'utilisateur

## Composants principaux

### 1. ProjectList
**Emplacement** : `src/components/ProjectList.tsx`

**Rôle** : Page d'accueil listant tous les projets de l'utilisateur

**Fonctionnalités** :
- Affichage en grille des projets
- Création de nouveau projet (modal)
- Édition des informations du projet
- Suppression d'un projet (avec confirmation)
- Navigation vers le dashboard d'un projet

### 2. ProjectModal
**Emplacement** : `src/components/ProjectModal.tsx`

**Rôle** : Modal de création/édition d'un projet

**Champs** :
- Titre du projet (obligatoire)
- Fichier scénario (optionnel)
- Date de début (optionnelle)
- Date de fin (optionnelle)

### 3. ProjectDashboard
**Emplacement** : `src/components/ProjectDashboard.tsx`

**Rôle** : Hub central d'un projet

**Navigation** :
- Vue par défaut : Kanban Board (plan de travail)
- Bouton "Dépouillement" : Accès à la gestion détaillée des séquences
- Bouton "Retour" : Retour à la liste des projets

### 4. KanbanBoard
**Modifications** : Accepte maintenant `projectId` en prop

**Filtre** : Charge uniquement les données du projet actif

### 5. DepouillementPage
**Modifications** : Accepte maintenant `projectId` en prop

**Filtre** : Charge uniquement les données du projet actif

## Flux utilisateur

### 1. Création d'un nouveau projet
```
Login → ProjectList → Clic "Nouveau projet" → Modal → Remplir infos → "Créer"
```

### 2. Travail sur un projet existant
```
Login → ProjectList → Clic "Ouvrir le projet" → ProjectDashboard
```

### 3. Dans le ProjectDashboard
```
Kanban Board (vue par défaut)
    ↓
Clic "Dépouillement" → DepouillementPage
    ↓
Créer/modifier séquences
    ↓
Clic "Retour" → Kanban Board (les séquences apparaissent)
```

### 4. Édition depuis le Kanban
```
Kanban → Clic "Éditer" sur une carte → DepouillementPage (pré-sélection de la séquence)
```

## Migration

### Étapes d'installation

1. **Exécuter la migration SQL** :
   - Ouvrir Supabase Dashboard
   - Aller dans SQL Editor
   - Copier/coller le contenu de `supabase/migrations/20251011140000_create_projects_table.sql`
   - Exécuter la requête

2. **Vérifier les tables** :
   ```sql
   -- Vérifier que la table projects existe
   SELECT * FROM projects LIMIT 1;
   
   -- Vérifier que les colonnes project_id ont été ajoutées
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'sequences' AND column_name = 'project_id';
   ```

3. **Créer un premier projet de test** :
   Une fois l'application redémarrée, connectez-vous et créez votre premier projet.

## Points d'attention

### Données existantes
⚠️ **Important** : Si vous aviez déjà des données (séquences, jours de tournage, décors) avant cette migration, elles auront `project_id = NULL` et ne seront plus accessibles.

**Solution** : Créer un projet "Migration" et mettre à jour manuellement les anciennes données :
```sql
-- Créer un projet de migration (remplacer USER_ID par votre ID)
INSERT INTO projects (user_id, title) 
VALUES ('USER_ID', 'Données migrées')
RETURNING id;

-- Mettre à jour les anciennes données (remplacer PROJECT_ID par l'ID retourné)
UPDATE sequences SET project_id = 'PROJECT_ID' WHERE project_id IS NULL;
UPDATE shooting_days SET project_id = 'PROJECT_ID' WHERE project_id IS NULL;
UPDATE decors SET project_id = 'PROJECT_ID' WHERE project_id IS NULL;
```

### Performances
Les index ont été créés sur les colonnes `project_id` pour garantir des requêtes rapides même avec beaucoup de données.

## Développement futur

### Fonctionnalités possibles
- 📊 Statistiques par projet (nombre de séquences, durée totale, etc.)
- 👥 Partage de projet entre utilisateurs (collaboration)
- 📦 Export/Import de projet complet
- 🎨 Personnalisation des couleurs/thèmes par projet
- 📅 Vue calendrier global de tous les projets
- 🔄 Archivage/désarchivage de projets
- 🔍 Recherche globale à travers tous les projets

### Structure de fichiers
```
src/
├── components/
│   ├── Auth.tsx
│   ├── ProjectList.tsx          ← Nouveau
│   ├── ProjectModal.tsx         ← Nouveau
│   ├── ProjectDashboard.tsx     ← Nouveau
│   ├── KanbanBoard.tsx          ← Modifié (+ projectId)
│   ├── DepouillementPage.tsx    ← Modifié (+ projectId)
│   ├── SequenceListSidebar.tsx
│   ├── SequenceFormGeneral.tsx
│   ├── NewSequenceModal.tsx
│   ├── NewDecorModal.tsx
│   └── ...
├── contexts/
│   └── AuthContext.tsx
└── App.tsx                      ← Modifié (nouveau routage)
```

## Support

En cas de problème :
1. Vérifier que la migration SQL a été exécutée sans erreur
2. Vérifier les RLS policies dans Supabase Dashboard
3. Consulter la console navigateur pour les erreurs
4. Vérifier que l'utilisateur est bien authentifié
