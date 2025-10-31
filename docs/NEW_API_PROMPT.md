# 🎬 PROMPT COMPLET - API FilmBoard (Nouvelle Architecture)

## 📋 Contexte du projet

Tu es une IA qui développe une API REST pour **FilmBoard**, une application d'assistant réalisateur pour la production cinématographique. L'application permet de :
- Gérer des projets de films
- Organiser les scènes et le dépouillement
- Planifier les jours de tournage
- Gérer les équipes (techniques et acteurs)
- Suivre tous les éléments nécessaires pour chaque scène

---

## 🗄️ Structure de la base de données

### Tables principales

#### 1. **_projects** - Projets de films
```sql
- id (uuid, PK)
- title (text, required)
- scenario_file (text, nullable)
- created_at, updated_at (timestamp)
```

#### 2. **_scenes** - Scènes du film
```sql
- id (uuid, PK)
- name (text)
- description (text)
- location (text) -- Lieu de tournage
- interior (boolean) -- Intérieur ou Extérieur
- created_at, updated_at (timestamp)
```

#### 3. **_shooting_days** - Jours de tournage
```sql
- id (uuid, PK)
- project_id (uuid, FK → _projects)
- title (text)
- start_time (timestamp) -- Début du tournage
- end_time (timestamp) -- Fin du tournage
- created_at, updated_at (timestamp)
```

#### 4. **_shootingday_scenes** - Association Jours ↔ Scènes
```sql
- id (uuid, PK)
- shooting_day_id (uuid, FK → _shooting_days)
- scene_id (uuid, FK → _scenes)
- created_at, updated_at (timestamp)
```
**Note** : Une scène peut être tournée sur plusieurs jours (multi-part)

---

### Tables d'équipe et personnes

#### 5. **_categories_personne** - Catégories de personnel
```sql
- id (text, PK)
- name (text, required)
```
**Exemples** : "Équipe Image", "Équipe Son", "Acteurs", "Figurants", "Direction", etc.

#### 6. **_hierarchie** - Niveaux hiérarchiques
```sql
- id (text, PK)
- name (text, required)
```
**Exemples** : "Chef de département", "Assistant", "Stagiaire", etc.

#### 7. **_roles_equipe_technique** - Rôles techniques
```sql
- id (text, PK)
- categories_personne_id (text, FK → _categories_personne)
- name (text, required)
```
**Exemples** : "Directeur photo", "Chef opérateur son", "Scripte", etc.

#### 8. **_roles_sur_scene** - Rôles devant la caméra
```sql
- id (text, PK)
- categories_personne_id (text, FK → _categories_personne)
- name (text, required)
```
**Exemples** : "Rôle principal", "Second rôle", "Figurant", "Silhouette", etc.

#### 9. **_personne** - Personnes (équipe + acteurs)
```sql
- id (uuid, PK)
- nom (text, required)
- prenom (text, required)
- categories_personne_id (text, FK → _categories_personne)
- role_id (text, required) -- FK vers _roles_equipe_technique OU _roles_sur_scene
- phone (text)
- email (text)
- notes (text)
- equipe (integer) -- Numéro d'équipe (1, 2, 3, etc.)
- hierarchy_id (text, FK → _hierarchie)
- created_at, updated_at (timestamp)
```

#### 10. **_scene_personnes** - Personnes assignées à une scène
```sql
- id (uuid, PK)
- scene_id (uuid, FK → _scenes)
- personne_id (uuid, FK → _personne)
- role_id (uuid) -- Rôle spécifique pour cette scène
- quantity (integer, default 1) -- Nombre (pour figurants)
- note (text)
- created_at, updated_at (timestamp)
```

---

### Tables d'éléments et dépouillement

#### 11. **_element_type** - Types d'éléments
```sql
- id (text, PK)
- name (text, required)
- description (text)
```
**Exemples** : "Véhicules", "Accessoires", "Costumes", "Maquillage", "Effets spéciaux", "Animaux", etc.

#### 12. **_elements_scene** - Catalogue d'éléments
```sql
- id (text, PK)
- element_type_id (text, FK → _element_type)
- name (text, required)
- description (text)
- created_at, updated_at (timestamp)
```
**Exemples** : "Voiture rouge années 50", "Chapeau haut-de-forme", "Faux sang", "Chien berger allemand", etc.

#### 13. **_scene_elements** - Éléments nécessaires pour une scène
```sql
- id (uuid, PK)
- scene_id (uuid, FK → _scenes)
- element_id (text, FK → _elements_scene)
- quantity (integer, default 1)
- notes (text)
- created_at, updated_at (timestamp)
```

---

### Tables de gestion utilisateurs

#### 14. **_users_projects** - Permissions utilisateurs sur projets
```sql
- id (uuid, PK)
- user_id (uuid, FK → auth.users)
- project_id (uuid, FK → _projects)
- created_at, updated_at (timestamp)
```

---

## 🎯 Objectifs de l'API

### Fonctionnalités principales à implémenter :

1. **Gestion des projets**
   - CRUD complet sur les projets
   - Gestion des permissions utilisateurs (qui peut accéder à quel projet)

2. **Gestion des scènes**
   - CRUD complet sur les scènes
   - Dépouillement : associer personnes et éléments aux scènes
   - Filtrage par lieu, intérieur/extérieur

3. **Planification des tournages**
   - CRUD des jours de tournage
   - Assigner/retirer des scènes à un jour
   - Réorganiser l'ordre des scènes dans un jour
   - Générer des feuilles de service (call sheets)

4. **Gestion d'équipe**
   - CRUD des personnes
   - Gestion des rôles et catégories
   - Assigner des personnes aux scènes
   - Filtrage par département, rôle, équipe

5. **Dépouillement technique**
   - CRUD des éléments (véhicules, accessoires, etc.)
   - Types et catégories d'éléments
   - Assigner éléments aux scènes avec quantités

6. **Vues agrégées**
   - Vue complète d'un jour de tournage (scènes + personnes + éléments)
   - Vue dépouillement par scène
   - Planning global du projet
   - Disponibilité des personnes/éléments

---

## 📝 ROUTES API À CRÉER

### 🎬 **PROJECTS** (Projets)

#### GET /api/projects
- **Auth** : Required
- **Description** : Liste tous les projets de l'utilisateur connecté
- **Query params** : 
  - `page` (integer, optional)
  - `limit` (integer, optional, default 20)
- **Response** : 
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "title": "string",
        "scenario_file": "string|null",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

#### POST /api/projects
- **Auth** : Required
- **Description** : Créer un nouveau projet
- **Body** :
```json
{
  "title": "string (required)",
  "scenario_file": "string (optional)"
}
```
- **Logic** : 
  - Créer le projet
  - Automatiquement créer une entrée dans `_users_projects` pour l'utilisateur
- **Response** : `{ success: true, data: { project: {...} } }`

#### GET /api/projects/:projectId
- **Auth** : Required
- **Description** : Détails d'un projet
- **Validation** : Vérifier que l'utilisateur a accès (via `_users_projects`)
- **Response** : Projet + statistiques (nb scènes, nb jours, etc.)

#### PUT /api/projects/:projectId
- **Auth** : Required
- **Description** : Modifier un projet
- **Body** : `{ title?, scenario_file? }`

#### DELETE /api/projects/:projectId
- **Auth** : Required
- **Description** : Supprimer un projet
- **Logic** : Cascade delete (jours, scenes assignées, permissions)

---

### 🎭 **SCENES** (Scènes)

#### GET /api/projects/:projectId/scenes
- **Auth** : Required
- **Description** : Liste toutes les scènes du projet
- **Query params** :
  - `interior` (boolean, optional) - Filtrer INT/EXT
  - `location` (string, optional) - Filtrer par lieu
  - `shooting_day_id` (uuid, optional) - Scènes d'un jour spécifique
- **Response** : Liste des scènes avec infos basiques

#### POST /api/projects/:projectId/scenes
- **Auth** : Required
- **Description** : Créer une nouvelle scène
- **Body** :
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "location": "string (optional)",
  "interior": "boolean (default: true)"
}
```

#### GET /api/scenes/:sceneId
- **Auth** : Required
- **Description** : Détails complets d'une scène
- **Include** :
  - Informations de base
  - Liste des personnes assignées (via `_scene_personnes`)
  - Liste des éléments nécessaires (via `_scene_elements`)
  - Jours de tournage où elle apparaît
- **Response** :
```json
{
  "success": true,
  "data": {
    "scene": {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "location": "string",
      "interior": "boolean",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    "personnes": [
      {
        "id": "uuid",
        "personne": { "nom": "...", "prenom": "..." },
        "role_id": "uuid",
        "quantity": 1,
        "note": "string"
      }
    ],
    "elements": [
      {
        "id": "uuid",
        "element": { "name": "...", "description": "..." },
        "quantity": 2,
        "notes": "string"
      }
    ],
    "shooting_days": [
      { "id": "uuid", "title": "...", "start_time": "..." }
    ]
  }
}
```

#### PUT /api/scenes/:sceneId
- **Auth** : Required
- **Description** : Modifier une scène
- **Body** : `{ name?, description?, location?, interior? }`

#### DELETE /api/scenes/:sceneId
- **Auth** : Required
- **Description** : Supprimer une scène
- **Logic** : Supprimer les associations (personnes, éléments, shooting_days)

---

### 📅 **SHOOTING DAYS** (Jours de tournage)

#### GET /api/projects/:projectId/shooting-days
- **Auth** : Required
- **Description** : Liste tous les jours de tournage du projet
- **Query params** :
  - `from_date` (timestamp, optional)
  - `to_date` (timestamp, optional)
- **Response** : Liste ordonnée par `start_time`

#### POST /api/projects/:projectId/shooting-days
- **Auth** : Required
- **Description** : Créer un jour de tournage
- **Body** :
```json
{
  "title": "string (optional)",
  "start_time": "timestamp (required)",
  "end_time": "timestamp (optional)"
}
```

#### GET /api/shooting-days/:dayId
- **Auth** : Required
- **Description** : Détails complets d'un jour de tournage
- **Include** :
  - Info du jour
  - Liste des scènes (via `_shootingday_scenes`)
  - Pour chaque scène : personnes et éléments nécessaires
- **Response** : Vue complète pour feuille de service (call sheet)

#### PUT /api/shooting-days/:dayId
- **Auth** : Required
- **Description** : Modifier un jour de tournage
- **Body** : `{ title?, start_time?, end_time? }`

#### DELETE /api/shooting-days/:dayId
- **Auth** : Required
- **Description** : Supprimer un jour
- **Logic** : Supprimer les associations scènes (table `_shootingday_scenes`)

#### POST /api/shooting-days/:dayId/scenes
- **Auth** : Required
- **Description** : Assigner une scène à un jour de tournage
- **Body** :
```json
{
  "scene_id": "uuid (required)"
}
```
- **Logic** : Créer une entrée dans `_shootingday_scenes`

#### DELETE /api/shooting-days/:dayId/scenes/:sceneId
- **Auth** : Required
- **Description** : Retirer une scène d'un jour de tournage
- **Logic** : Supprimer l'entrée dans `_shootingday_scenes`

---

### 👥 **PERSONNES** (Équipe & Acteurs)

#### GET /api/projects/:projectId/personnes
- **Auth** : Required
- **Description** : Liste toutes les personnes du projet
- **Query params** :
  - `category_id` (text, optional) - Filtrer par catégorie
  - `equipe` (integer, optional) - Filtrer par numéro d'équipe
  - `role_id` (text, optional) - Filtrer par rôle
- **Response** : Liste avec infos complètes (catégorie, rôle, hiérarchie)

#### POST /api/projects/:projectId/personnes
- **Auth** : Required
- **Description** : Ajouter une personne au projet
- **Body** :
```json
{
  "nom": "string (required)",
  "prenom": "string (required)",
  "categories_personne_id": "text (required)",
  "role_id": "text (required)",
  "phone": "string (optional)",
  "email": "string (optional)",
  "notes": "string (optional)",
  "equipe": "integer (optional)",
  "hierarchy_id": "text (optional)"
}
```

#### GET /api/personnes/:personneId
- **Auth** : Required
- **Description** : Détails d'une personne
- **Include** : Liste des scènes où elle est assignée

#### PUT /api/personnes/:personneId
- **Auth** : Required
- **Description** : Modifier une personne
- **Body** : Tous les champs modifiables

#### DELETE /api/personnes/:personneId
- **Auth** : Required
- **Description** : Supprimer une personne
- **Logic** : Supprimer les associations aux scènes

#### POST /api/scenes/:sceneId/personnes
- **Auth** : Required
- **Description** : Assigner une personne à une scène
- **Body** :
```json
{
  "personne_id": "uuid (required)",
  "role_id": "uuid (optional)",
  "quantity": "integer (default: 1)",
  "note": "string (optional)"
}
```

#### PUT /api/scenes/:sceneId/personnes/:assignmentId
- **Auth** : Required
- **Description** : Modifier une assignation personne-scène
- **Body** : `{ role_id?, quantity?, note? }`

#### DELETE /api/scenes/:sceneId/personnes/:assignmentId
- **Auth** : Required
- **Description** : Retirer une personne d'une scène

---

### 🎨 **ELEMENTS** (Dépouillement technique)

#### GET /api/element-types
- **Auth** : Required
- **Description** : Liste tous les types d'éléments
- **Response** : Types globaux (Véhicules, Accessoires, etc.)

#### GET /api/elements
- **Auth** : Required
- **Description** : Liste tous les éléments disponibles
- **Query params** :
  - `element_type_id` (text, optional) - Filtrer par type
  - `search` (string, optional) - Recherche par nom

#### POST /api/elements
- **Auth** : Required
- **Description** : Créer un nouvel élément
- **Body** :
```json
{
  "element_type_id": "text (required)",
  "name": "string (required)",
  "description": "string (optional)"
}
```

#### PUT /api/elements/:elementId
- **Auth** : Required
- **Description** : Modifier un élément

#### DELETE /api/elements/:elementId
- **Auth** : Required
- **Description** : Supprimer un élément

#### POST /api/scenes/:sceneId/elements
- **Auth** : Required
- **Description** : Assigner un élément à une scène
- **Body** :
```json
{
  "element_id": "text (required)",
  "quantity": "integer (default: 1)",
  "notes": "string (optional)"
}
```

#### PUT /api/scenes/:sceneId/elements/:assignmentId
- **Auth** : Required
- **Description** : Modifier une assignation élément-scène
- **Body** : `{ quantity?, notes? }`

#### DELETE /api/scenes/:sceneId/elements/:assignmentId
- **Auth** : Required
- **Description** : Retirer un élément d'une scène

---

### 📊 **VUES AGRÉGÉES & REPORTS**

#### GET /api/projects/:projectId/planning
- **Auth** : Required
- **Description** : Vue planning complète du projet
- **Response** :
```json
{
  "success": true,
  "data": {
    "project": { "id": "...", "title": "..." },
    "shooting_days": [
      {
        "id": "uuid",
        "title": "string",
        "start_time": "timestamp",
        "end_time": "timestamp",
        "scenes": [
          {
            "id": "uuid",
            "name": "string",
            "location": "string",
            "interior": "boolean",
            "personnes_count": 5,
            "elements_count": 3
          }
        ]
      }
    ],
    "statistics": {
      "total_scenes": 50,
      "total_shooting_days": 20,
      "total_personnes": 30,
      "total_elements": 100
    }
  }
}
```

#### GET /api/projects/:projectId/depouillement
- **Auth** : Required
- **Description** : Vue dépouillement complète
- **Response** : Toutes les scènes avec leurs personnes et éléments
- **Group by** : Peut être groupé par type d'élément, catégorie, etc.

#### GET /api/shooting-days/:dayId/call-sheet
- **Auth** : Required
- **Description** : Feuille de service PDF-ready
- **Response** : Données formatées pour génération PDF
- **Include** :
  - Info du jour
  - Liste des scènes avec ordre
  - Pour chaque scène : lieu, INT/EXT, description
  - Équipe complète nécessaire (avec contacts)
  - Tous les éléments nécessaires (avec quantités)

#### GET /api/projects/:projectId/disponibilites
- **Auth** : Required
- **Description** : Disponibilité des personnes et éléments
- **Query params** :
  - `from_date` (timestamp)
  - `to_date` (timestamp)
- **Response** : Calendrier de disponibilité

---

### 🔧 **CATEGORIES & METADATA** (Tables de référence)

#### GET /api/categories-personne
- **Auth** : Required
- **Description** : Liste toutes les catégories de personnel

#### POST /api/categories-personne
- **Auth** : Admin only
- **Description** : Créer une catégorie

#### GET /api/roles-equipe-technique
- **Auth** : Required
- **Description** : Liste des rôles techniques
- **Query params** : `category_id` (optional)

#### POST /api/roles-equipe-technique
- **Auth** : Admin only
- **Description** : Créer un rôle technique

#### GET /api/roles-sur-scene
- **Auth** : Required
- **Description** : Liste des rôles sur scène
- **Query params** : `category_id` (optional)

#### POST /api/roles-sur-scene
- **Auth** : Admin only
- **Description** : Créer un rôle sur scène

#### GET /api/hierarchie
- **Auth** : Required
- **Description** : Liste des niveaux hiérarchiques

---

### 👤 **USERS & PERMISSIONS**

#### POST /api/projects/:projectId/users
- **Auth** : Required (Owner only)
- **Description** : Ajouter un utilisateur au projet
- **Body** : `{ user_id: "uuid" }`

#### DELETE /api/projects/:projectId/users/:userId
- **Auth** : Required (Owner only)
- **Description** : Retirer un utilisateur du projet

#### GET /api/projects/:projectId/users
- **Auth** : Required
- **Description** : Liste des utilisateurs ayant accès au projet

---

## 🔐 Sécurité & Permissions

### Middleware d'authentification
```javascript
authenticate(req, res, next) {
  // Extraire le token JWT du header Authorization
  // Vérifier la validité
  // Extraire user_id et l'attacher à req.userId
}
```

### Middleware de permissions projet
```javascript
checkProjectAccess(req, res, next) {
  // Vérifier que req.userId a accès au projet via _users_projects
  // Si non : 403 Forbidden
}
```

### Règles importantes
1. **Toutes les routes** nécessitent une authentification
2. **Accès projet** : Vérifier via `_users_projects` avant toute opération
3. **Cascade deletes** : Bien gérer les suppressions en cascade
4. **Validation** : Valider tous les UUIDs et données entrantes
5. **Timestamps** : Toujours mettre à jour `updated_at`

---

## 📦 Structure des réponses

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "message": "string",
    "code": "string (optional)",
    "details": {} 
  }
}
```

### HTTP Status Codes
- `200` : Success (GET, PUT, DELETE)
- `201` : Created (POST)
- `400` : Bad Request (validation error)
- `401` : Unauthorized (no token / invalid token)
- `403` : Forbidden (no permission)
- `404` : Not Found
- `500` : Internal Server Error

---

## 🚀 Ordre d'implémentation recommandé

### Phase 1 : Core (Projets & Scènes)
1. Auth middleware
2. GET/POST/PUT/DELETE `/api/projects`
3. GET/POST/PUT/DELETE `/api/projects/:id/scenes`
4. GET `/api/scenes/:id` (avec détails)
5. Permissions utilisateurs (`_users_projects`)

### Phase 2 : Planning
6. CRUD `/api/projects/:id/shooting-days`
7. POST/DELETE `/api/shooting-days/:id/scenes`
8. GET `/api/shooting-days/:id` (avec scènes)
9. GET `/api/projects/:id/planning` (vue agrégée)

### Phase 3 : Équipe
10. CRUD `/api/projects/:id/personnes`
11. POST/PUT/DELETE `/api/scenes/:id/personnes`
12. Tables de référence (catégories, rôles, hiérarchie)

### Phase 4 : Dépouillement
13. CRUD `/api/elements` et `/api/element-types`
14. POST/PUT/DELETE `/api/scenes/:id/elements`
15. GET `/api/projects/:id/depouillement` (vue agrégée)

### Phase 5 : Features avancées
16. GET `/api/shooting-days/:id/call-sheet`
17. GET `/api/projects/:id/disponibilites`
18. Endpoints de recherche et filtrage avancés

---

## 📝 Notes techniques importantes

### Relations complexes à gérer

1. **Scènes multi-jours** : Une scène peut être sur plusieurs jours via `_shootingday_scenes`
2. **Rôles polymorphiques** : `_personne.role_id` peut pointer vers `_roles_equipe_technique` OU `_roles_sur_scene`
3. **Quantités** : Pour `_scene_personnes` et `_scene_elements` (figurants, accessoires multiples)

### Optimisations à prévoir

1. **Eager loading** : Charger les relations en une requête (éviter N+1)
2. **Pagination** : Sur toutes les listes
3. **Indexes** : Sur les foreign keys et colonnes fréquemment filtrées
4. **Caching** : Pour les tables de référence (catégories, rôles, types)

### Fonctionnalités futures possibles

1. **Import/Export** : Scénario PDF → Scènes automatiques
2. **Notifications** : Alertes pour conflits de planning
3. **Budget** : Tracking coûts par scène/jour
4. **Documents** : Stockage fichiers (photos, plans, etc.)
5. **Versions** : Historique des modifications

---

## ✅ Checklist finale

Pour chaque route, implémenter :
- [ ] Middleware d'authentification
- [ ] Validation des permissions (accès projet)
- [ ] Validation des données entrantes (joi/zod)
- [ ] Gestion des erreurs (try/catch)
- [ ] Logs appropriés
- [ ] Tests unitaires
- [ ] Documentation OpenAPI/Swagger

---

**Total estimé : ~60-70 routes API**

Bonne chance pour l'implémentation ! 🎬🚀
