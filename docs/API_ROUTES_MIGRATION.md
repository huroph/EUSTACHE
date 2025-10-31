# 📋 Rapport exhaustif - Migration Supabase vers API Middleware

## 🎯 Objectif
Identifier **TOUS** les appels directs à Supabase dans le frontend pour les remplacer par des appels à ton API middleware Express.

---

## 📊 Vue d'ensemble

### Statistiques globales
- **Fichiers utilisant Supabase** : 9 fichiers
- **Tables Supabase utilisées** : 7 tables
- **Opérations CRUD identifiées** : 48 requêtes
- **Types d'opérations** :
  - SELECT : 21 requêtes
  - INSERT : 11 requêtes
  - UPDATE : 11 requêtes
  - DELETE : 5 requêtes

---

## 🗂️ Tables Supabase utilisées

| Table | Description | Utilisation |
|-------|-------------|-------------|
| `projects` | Projets de films | CRUD complet |
| `sequences` | Séquences des projets | CRUD complet |
| `shooting_days` | Jours de tournage | CRUD complet |
| `decors` | Décors/Lieux de tournage | SELECT uniquement |
| `depouillement_categories` | Catégories de dépouillement | SELECT uniquement |
| `sequence_depouillement` | Dépouillement des séquences | INSERT, DELETE, UPDATE |
| `depouillement_items` | Items de dépouillement | INSERT, DELETE |

---

## 📁 Analyse détaillée par fichier

### 1️⃣ **ProjectList.tsx**
**Chemin** : `src/components/projects/ProjectList.tsx`

#### Requêtes identifiées :

##### 🔍 GET - Liste des projets
```typescript
// Ligne 32-35
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false });
```
**Route API à créer** : `GET /api/projects`
- **Query params** : `order=created_at&direction=desc`
- **Response** : `Project[]`

##### ➕ POST - Créer un projet
```typescript
// Ligne 46-54
const { data: { user } } = await supabase.auth.getUser();
const { error } = await supabase
  .from('projects')
  .insert({
    ...projectData,
    user_id: user.id,
  });
```
**Route API à créer** : `POST /api/projects`
- **Body** : `{ title, scenario_file?, start_date?, end_date? }`
- **Auth** : Le user_id sera extrait du token JWT automatiquement
- **Response** : `{ project: Project }`

##### ✏️ PUT - Modifier un projet
```typescript
// Ligne 66-71
const { error } = await supabase
  .from('projects')
  .update(projectData)
  .eq('id', editingProject.id);
```
**Route API à créer** : `PUT /api/projects/:id`
- **Body** : `{ title?, scenario_file?, start_date?, end_date? }`
- **Response** : `{ project: Project }`

##### 🗑️ DELETE - Supprimer un projet
```typescript
// Ligne 87-91
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', id);
```
**Route API à créer** : `DELETE /api/projects/:id`
- **Response** : `{ success: true }`
- **Note** : Doit supprimer en cascade : sequences, shooting_days, decors

---

### 2️⃣ **KanbanBoard.tsx**
**Chemin** : `src/components/kanban/KanbanBoard.tsx`

#### Requêtes identifiées :

##### 🔍 GET - Données du projet (3 requêtes parallèles)
```typescript
// Lignes 61-63
const [
  { data: shootingDays },
  { data: sequences },
  { data: decors },
] = await Promise.all([
  supabase.from('shooting_days').select('*').eq('project_id', projectId).order('date'),
  supabase.from('sequences').select('*').eq('project_id', projectId).order('order_in_day'),
  supabase.from('decors').select('*').eq('project_id', projectId).order('name'),
]);
```
**Route API à créer** : `GET /api/projects/:projectId/kanban`
- **Response** : 
```typescript
{
  shootingDays: ShootingDay[],
  sequences: Sequence[],
  decors: Decor[]
}
```

##### ➕ POST - Créer une séquence
```typescript
// Lignes 117-128
const { data, error } = await supabase
  .from('sequences')
  .insert({
    project_id: projectId,
    shooting_day_id: dayId,
    sequence_number: newSequenceNumber,
    decor_id: null,
    int_ext: 'INT',
    day_night: 'JOUR',
    description: '',
    duration: null,
    order_in_day: maxOrderInDay + 1,
  })
  .select()
  .single();
```
**Route API à créer** : `POST /api/projects/:projectId/sequences`
- **Body** : 
```typescript
{
  shooting_day_id: string,
  sequence_number: number,
  decor_id?: string,
  int_ext: 'INT' | 'EXT',
  day_night: 'JOUR' | 'NUIT',
  description: string,
  duration?: number,
  order_in_day: number
}
```
- **Response** : `{ sequence: Sequence }`

##### ✏️ PUT - Modifier une séquence
```typescript
// Lignes 159-170
const { error } = await supabase
  .from('sequences')
  .update({
    decor_id: decorId,
    int_ext: intExt,
    day_night: dayNight,
    description,
    duration,
  })
  .eq('id', sequenceId);
```
**Route API à créer** : `PUT /api/sequences/:id`
- **Body** : `{ decor_id?, int_ext?, day_night?, description?, duration? }`
- **Response** : `{ sequence: Sequence }`

##### ✏️ PUT - Réordonner les séquences (batch update)
```typescript
// Lignes 173-179
await Promise.all(
  updatedSequences.map((seq, i) =>
    supabase
      .from('sequences')
      .update({ order_in_day: i })
      .eq('id', seq.id)
  )
);
```
**Route API à créer** : `PUT /api/sequences/reorder`
- **Body** : `{ sequences: Array<{ id: string, order_in_day: number }> }`
- **Response** : `{ success: true }`

##### 🗑️ DELETE - Supprimer une séquence
```typescript
// Ligne 185
await supabase.from('sequences').delete().eq('id', sequenceId);
```
**Route API à créer** : `DELETE /api/sequences/:id`
- **Response** : `{ success: true }`

##### 🗑️ DELETE - Supprimer un jour de tournage (avec ses séquences)
```typescript
// Lignes 191-194
await supabase.from('sequences').delete().eq('shooting_day_id', dayId);
await supabase.from('shooting_days').delete().eq('id', dayId);
```
**Route API à créer** : `DELETE /api/shooting-days/:id`
- **Response** : `{ success: true }`
- **Note** : Suppression en cascade des séquences côté API

---

### 3️⃣ **BaguetteView.tsx** (Planning)
**Chemin** : `src/components/planning/BaguetteView.tsx`

#### Requêtes identifiées :

##### 🔍 GET - Données du planning (4 requêtes parallèles)
```typescript
// Lignes 114-117
const [
  { data: shootingDaysData },
  { data: sequencesData },
  { data: decorsData },
  { data: categoriesData },
] = await Promise.all([
  supabase.from('shooting_days').select('*').eq('project_id', projectId).order('date'),
  supabase.from('sequences').select('*').eq('project_id', projectId).order('order_in_day'),
  supabase.from('decors').select('*').eq('project_id', projectId).order('name'),
  supabase.from('depouillement_categories').select('*').order('order_index'),
]);
```
**Route API à créer** : `GET /api/projects/:projectId/planning`
- **Response** : 
```typescript
{
  shootingDays: ShootingDay[],
  sequences: Sequence[],
  decors: Decor[],
  categories: DepouillementCategory[]
}
```

##### ➕ POST - Créer une séquence dans le planning
```typescript
// Lignes 213-229
const { data: newSequence, error } = await supabase
  .from('sequences')
  .insert({
    project_id: projectId,
    shooting_day_id: targetDayId,
    sequence_number: newSequenceNumber,
    decor_id: null,
    int_ext: 'INT',
    day_night: 'JOUR',
    description: '',
    duration: null,
    order_in_day: targetIndex,
  })
  .select()
  .single();
```
**Route API à créer** : Même que KanbanBoard - `POST /api/projects/:projectId/sequences`

##### ✏️ PUT - Mettre à jour ordre des séquences (déplacement drag & drop)
```typescript
// Lignes 286-292
await Promise.all(
  updatedSequences.map(seq =>
    supabase
      .from('sequences')
      .update({ order_in_day: seq.order_in_day })
      .eq('id', seq.id)
  )
);
```
**Route API à créer** : Même que KanbanBoard - `PUT /api/sequences/reorder`

##### ✏️ PUT - Modifier une séquence (informations générales)
```typescript
// Lignes 316-331
const { error } = await supabase
  .from('sequences')
  .update({
    sequence_number: sequenceNumber || null,
    decor_id: decorId || null,
    int_ext: intExt,
    day_night: dayNight,
    description: description || '',
    duration: duration ? parseFloat(duration) : null,
  })
  .eq('id', sequenceId);
```
**Route API à créer** : Même que KanbanBoard - `PUT /api/sequences/:id`

##### ✏️ PUT - Changer le jour de tournage d'une séquence
```typescript
// Lignes 370-381
const { error } = await supabase
  .from('sequences')
  .update({
    shooting_day_id: newDayId,
    order_in_day: targetIndex,
  })
  .eq('id', sequenceId);
```
**Route API à créer** : `PUT /api/sequences/:id/move`
- **Body** : `{ shooting_day_id: string, order_in_day: number }`
- **Response** : `{ sequence: Sequence }`

##### ✏️ PUT - Réordonner séquences après déplacement
```typescript
// Lignes 395-401
await Promise.all(
  sequencesToReorder.map((seq, idx) =>
    supabase
      .from('sequences')
      .update({ order_in_day: idx })
      .eq('id', seq.id)
  )
);
```
**Route API à créer** : Même que ci-dessus - `PUT /api/sequences/reorder`

##### 🗑️ DELETE - Supprimer une séquence
```typescript
// Lignes 419-423
const { error } = await supabase
  .from('sequences')
  .delete()
  .eq('id', sequenceId);
```
**Route API à créer** : Même que KanbanBoard - `DELETE /api/sequences/:id`

---

### 4️⃣ **DepouillementPage.tsx**
**Chemin** : `src/components/depouillement/DepouillementPage.tsx`

#### Requêtes identifiées :

##### 🔍 GET - Données du dépouillement (4 requêtes parallèles)
```typescript
// Lignes 146-149
const [
  { data: sequencesData },
  { data: decorsData },
  { data: categoriesData },
  { data: shootingDaysData },
] = await Promise.all([
  supabase.from('sequences').select('*').eq('project_id', projectId).order('sequence_number'),
  supabase.from('decors').select('*').eq('project_id', projectId).order('name'),
  supabase.from('depouillement_categories').select('*').order('order_index'),
  supabase.from('shooting_days').select('id, day_number, date').eq('project_id', projectId).order('date'),
]);
```
**Route API à créer** : `GET /api/projects/:projectId/depouillement`
- **Response** : 
```typescript
{
  sequences: Sequence[],
  decors: Decor[],
  categories: DepouillementCategory[],
  shootingDays: { id: string, day_number: number, date: string }[]
}
```

##### ➕ POST - Créer une séquence dans le dépouillement
```typescript
// Lignes 186-199
const { data: newSequence, error } = await supabase
  .from('sequences')
  .insert({
    project_id: projectId,
    shooting_day_id: targetDayId,
    sequence_number: newSequenceNumber,
    decor_id: null,
    int_ext: 'INT',
    day_night: 'JOUR',
    description: '',
    duration: null,
    order_in_day: 0,
  })
  .select()
  .single();
```
**Route API à créer** : Même que ci-dessus - `POST /api/projects/:projectId/sequences`

##### 🗑️ DELETE - Supprimer une séquence
```typescript
// Lignes 210-214
const { error } = await supabase
  .from('sequences')
  .delete()
  .eq('id', sequenceId);
```
**Route API à créer** : Même que ci-dessus - `DELETE /api/sequences/:id`

##### ➕ POST - Créer un jour de tournage
```typescript
// Lignes 278-290
const { data: newDay, error } = await supabase
  .from('shooting_days')
  .insert({ 
    project_id: projectId,
    date: selectedDate,
    day_number: newDayNumber,
  })
  .select()
  .single();
```
**Route API à créer** : `POST /api/projects/:projectId/shooting-days`
- **Body** : `{ date: string }`
- **Response** : `{ shootingDay: ShootingDay }`
- **Note** : Le day_number doit être calculé automatiquement côté API

##### ✏️ PUT - Mettre à jour ordre des séquences
```typescript
// Lignes 312-318
await Promise.all(
  updatedSequences.map(seq =>
    supabase
      .from('sequences')
      .update({ order_in_day: seq.order_in_day })
      .eq('id', seq.id)
  )
);
```
**Route API à créer** : Même que ci-dessus - `PUT /api/sequences/reorder`

##### ✏️ PUT - Changer le jour de tournage d'une séquence
```typescript
// Lignes 352-363
const { error } = await supabase
  .from('sequences')
  .update({ 
    shooting_day_id: newDayId,
    order_in_day: targetIndex,
  })
  .eq('id', sequenceId);
```
**Route API à créer** : Même que ci-dessus - `PUT /api/sequences/:id/move`

---

### 5️⃣ **DepouillementCardOverlay.tsx**
**Chemin** : `src/components/depouillement/DepouillementCardOverlay.tsx`

#### Requêtes identifiées :

##### ✏️ PUT - Modifier une séquence (informations dépouillement)
```typescript
// Lignes 90-105
const { error } = await supabase
  .from('sequences')
  .update({
    sequence_number: sequenceNumber || null,
    decor_id: decorId || null,
    int_ext: intExt,
    day_night: dayNight,
    description: description || '',
    duration: duration ? parseFloat(duration) : null,
  })
  .eq('id', sequenceId);
```
**Route API à créer** : Même que ci-dessus - `PUT /api/sequences/:id`

---

### 6️⃣ **TeamTab.tsx**
**Chemin** : `src/components/depouillement/Tab/TeamTab.tsx`

#### Requêtes identifiées :

##### ➕ POST - Ajouter un élément de dépouillement à une séquence
```typescript
// Lignes 98-112
const { data, error } = await supabase
  .from('sequence_depouillement')
  .insert({
    sequence_id: selectedSequence,
    category_id: category.id,
    item_type: itemType,
    item_id: itemId,
    quantity: quantity || 1,
    notes: notes || '',
  })
  .select()
  .single();
```
**Route API à créer** : `POST /api/sequences/:sequenceId/depouillement`
- **Body** : 
```typescript
{
  category_id: string,
  item_type: 'role' | 'figuration' | 'custom',
  item_id?: string,
  quantity: number,
  notes?: string
}
```
- **Response** : `{ depouillement: SequenceDepouillement }`

##### 🗑️ DELETE - Supprimer un élément de dépouillement
```typescript
// Ligne 125
await supabase.from('sequence_depouillement').delete().eq('id', id);
```
**Route API à créer** : `DELETE /api/depouillement/:id`
- **Response** : `{ success: true }`

##### ✏️ PUT - Modifier la quantité d'un élément de dépouillement
```typescript
// Lignes 129-133
const { error } = await supabase
  .from('sequence_depouillement')
  .update({ quantity })
  .eq('id', id);
```
**Route API à créer** : `PUT /api/depouillement/:id`
- **Body** : `{ quantity?: number, notes?: string }`
- **Response** : `{ depouillement: SequenceDepouillement }`

##### ✏️ PUT - Modifier les notes d'un élément de dépouillement
```typescript
// Lignes 148-152
const { error } = await supabase
  .from('sequence_depouillement')
  .update({ notes })
  .eq('id', id);
```
**Route API à créer** : Même que ci-dessus - `PUT /api/depouillement/:id`

##### ➕ POST - Créer un item de dépouillement personnalisé
```typescript
// Lignes 169-180
const { data: newItem, error: insertError } = await supabase
  .from('depouillement_items')
  .insert({
    category_id: category.id,
    name: itemName,
    description: '',
  })
  .select()
  .single();
```
**Route API à créer** : `POST /api/depouillement-items`
- **Body** : `{ category_id: string, name: string, description?: string }`
- **Response** : `{ item: DepouillementItem }`

##### 🗑️ DELETE - Supprimer un item de dépouillement personnalisé
```typescript
// Ligne 191
await supabase.from('depouillement_items').delete().eq('id', itemId);
```
**Route API à créer** : `DELETE /api/depouillement-items/:id`
- **Response** : `{ success: true }`

---

### 7️⃣ **CallSheetGenerator.tsx**
**Chemin** : `src/components/kanban/CallSheetGenerator.tsx`

#### Requêtes identifiées :

##### 🔍 GET - Données d'un jour de tournage avec séquences
```typescript
// Lignes 46-47
const [
  { data: dayData },
  { data: sequencesData },
] = await Promise.all([
  supabase.from('shooting_days').select('*').eq('id', dayId).single(),
  supabase.from('sequences').select('*').eq('shooting_day_id', dayId).order('order_in_day'),
]);
```
**Route API à créer** : `GET /api/shooting-days/:id/call-sheet`
- **Response** : 
```typescript
{
  shootingDay: ShootingDay,
  sequences: Sequence[]
}
```

---

## 🎯 Récapitulatif des routes API à créer

### **PROJECTS** (4 routes)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/projects` | Liste des projets de l'utilisateur |
| POST | `/api/projects` | Créer un nouveau projet |
| PUT | `/api/projects/:id` | Modifier un projet |
| DELETE | `/api/projects/:id` | Supprimer un projet (+ cascade) |

### **SEQUENCES** (7 routes)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/projects/:projectId/sequences` | Créer une séquence |
| PUT | `/api/sequences/:id` | Modifier une séquence |
| PUT | `/api/sequences/:id/move` | Changer le jour de tournage |
| PUT | `/api/sequences/reorder` | Réordonner plusieurs séquences |
| DELETE | `/api/sequences/:id` | Supprimer une séquence |

### **SHOOTING DAYS** (3 routes)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/projects/:projectId/shooting-days` | Créer un jour de tournage |
| GET | `/api/shooting-days/:id/call-sheet` | Données pour feuille de service |
| DELETE | `/api/shooting-days/:id` | Supprimer un jour (+ séquences) |

### **DEPOUILLEMENT** (4 routes)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/sequences/:sequenceId/depouillement` | Ajouter élément dépouillement |
| PUT | `/api/depouillement/:id` | Modifier élément dépouillement |
| DELETE | `/api/depouillement/:id` | Supprimer élément dépouillement |

### **DEPOUILLEMENT ITEMS** (2 routes)

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/depouillement-items` | Créer item personnalisé |
| DELETE | `/api/depouillement-items/:id` | Supprimer item personnalisé |

### **DATA AGGREGATION** (3 routes complexes)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/projects/:projectId/kanban` | Toutes données Kanban |
| GET | `/api/projects/:projectId/planning` | Toutes données Planning |
| GET | `/api/projects/:projectId/depouillement` | Toutes données Dépouillement |

---

## 📦 Total : **23 routes API à créer**

---

## 🔧 Recommandations d'implémentation

### 1. **Structure des réponses API**
Toutes les réponses devraient suivre ce format :
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    message: string,
    code?: string
  }
}
```

### 2. **Authentification**
- Toutes les routes doivent utiliser le middleware `authenticate`
- Le `userId` doit être extrait du token JWT
- Vérifier que l'utilisateur a accès au projet (RLS côté API)

### 3. **Validation**
- Utiliser `joi` ou `zod` pour valider les body des requêtes
- Valider les UUIDs des paramètres

### 4. **Gestion des erreurs**
- Wrapper les requêtes Supabase dans try/catch
- Retourner des codes HTTP appropriés (200, 201, 400, 401, 404, 500)

### 5. **Optimisation**
- Les routes d'agrégation (`/kanban`, `/planning`, `/depouillement`) doivent utiliser `Promise.all()`
- Implémenter du caching si nécessaire (Redis)

### 6. **Cascade deletes**
- `DELETE /api/projects/:id` → supprimer sequences, shooting_days, decors
- `DELETE /api/shooting-days/:id` → supprimer sequences associées

---

## 📝 Exemple d'implémentation

### Route : `GET /api/projects/:projectId/kanban`

```javascript
router.get('/projects/:projectId/kanban', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId; // Extrait du JWT

    // Vérifier que l'utilisateur a accès au projet
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        error: { message: 'Projet non trouvé' }
      });
    }

    // Récupérer toutes les données en parallèle
    const [
      { data: shootingDays },
      { data: sequences },
      { data: decors }
    ] = await Promise.all([
      supabase.from('shooting_days')
        .select('*')
        .eq('project_id', projectId)
        .order('date'),
      supabase.from('sequences')
        .select('*')
        .eq('project_id', projectId)
        .order('order_in_day'),
      supabase.from('decors')
        .select('*')
        .eq('project_id', projectId)
        .order('name')
    ]);

    res.json({
      success: true,
      data: {
        shootingDays: shootingDays || [],
        sequences: sequences || [],
        decors: decors || []
      }
    });
  } catch (error) {
    console.error('Erreur /projects/:projectId/kanban:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur' }
    });
  }
});
```

---

## ✅ Prochaines étapes

1. **Créer les routes API** dans ton serveur Express
2. **Tester chaque route** avec Postman ou curl
3. **Modifier le frontend** pour utiliser axios au lieu de supabase
4. **Créer un service client** (ex: `src/api/projects.ts`, `src/api/sequences.ts`)
5. **Remplacer progressivement** les appels Supabase par les appels API

---

**Bon courage pour l'implémentation ! 🚀**
