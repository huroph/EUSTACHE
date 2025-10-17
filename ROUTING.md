# Structure de Routing - FilmBoard

## 🗺️ Routes de l'application

### Architecture des routes

```
/                                    → Liste des projets
/projects/:projectId                 → Redirect vers /planning
/projects/:projectId/planning        → Vue Kanban / Plan de travail
/projects/:projectId/depouillement   → Vue Dépouillement
  ?sequence=:sequenceId              → Avec séquence pré-sélectionnée (optionnel)
```

## 📋 Détails des routes

### 1. Page d'accueil - Liste des projets
**Route :** `/`  
**Composant :** `ProjectList`  
**Description :** Affiche tous les projets de l'utilisateur avec possibilité de créer, modifier, supprimer

**Actions :**
- Cliquer sur "Ouvrir le projet" → Navigation vers `/projects/:projectId/planning`

---

### 2. Layout du projet
**Route :** `/projects/:projectId`  
**Composant :** `ProjectLayout`  
**Description :** Layout parent qui contient le header avec navigation entre vues

**Éléments du header :**
- Bouton "Retour" → Navigation vers `/`
- Titre du projet
- Onglets de navigation :
  - **Planning** (icône Calendar) → `/projects/:projectId/planning`
  - **Dépouillement** (icône FileText) → `/projects/:projectId/depouillement`

**Comportement :**
- Redirect automatique vers `/planning` si on accède à `/projects/:projectId`
- Les onglets utilisent `NavLink` pour affichage de l'onglet actif

---

### 3. Vue Planning (Kanban)
**Route :** `/projects/:projectId/planning`  
**Composant :** `PlanningView` → `KanbanBoard`  
**Description :** Tableau Kanban avec jours de tournage et séquences

**Nom de la route :** **Planning** (choisi pour être plus générique qu'un simple "Kanban")

**Fonctionnalités :**
- Affichage des colonnes par jour de tournage
- Drag & drop des séquences entre jours
- Création de nouveaux jours de tournage
- Filtres par département
- Génération de feuille de service (call sheet)

**Navigation interne :**
- Double-clic sur séquence → Ouvre `SequenceModal` (modal)
- Bouton "Dépouillement" sur une séquence → Navigation vers `/projects/:projectId/depouillement?sequence=:sequenceId`

---

### 4. Vue Dépouillement
**Route :** `/projects/:projectId/depouillement`  
**Query params :** `?sequence=:sequenceId` (optionnel)  
**Composant :** `DepouillementView` → `DepouillementPage`  
**Description :** Interface de dépouillement avec PDF, formulaire et liste des séquences

**Layout :**
- **Gauche (40%)** : Visionneuse PDF du scénario
- **Centre (flexible)** : Formulaire de la séquence + onglets de catégories (26 catégories)
- **Droite (collapsible)** : Liste des séquences

**Fonctionnalités :**
- Visualisation du PDF scénario
- Édition complète d'une séquence
- Gestion du dépouillement par catégorie
- Navigation entre séquences via la sidebar

**Query params :**
- Si `?sequence=:sequenceId` présent → Séquence pré-sélectionnée au chargement
- Sinon → Première séquence sélectionnée par défaut

---

## 🔧 Implémentation technique

### Configuration du router (`src/router.tsx`)

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProjectList />,
  },
  {
    path: '/projects/:projectId',
    element: <ProjectLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="planning" replace />,
      },
      {
        path: 'planning',
        element: <PlanningView />,
      },
      {
        path: 'depouillement',
        element: <DepouillementView />,
      },
    ],
  },
]);
```

### Composants wrapper

#### PlanningView
```typescript
import { useParams, useNavigate } from 'react-router-dom';

export function PlanningView() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleOpenDepouillement = (sequenceId?: string) => {
    if (sequenceId) {
      navigate(`/projects/${projectId}/depouillement?sequence=${sequenceId}`);
    } else {
      navigate(`/projects/${projectId}/depouillement`);
    }
  };

  return <KanbanBoard projectId={projectId} onOpenDepouillement={handleOpenDepouillement} />;
}
```

#### DepouillementView
```typescript
import { useParams, useSearchParams } from 'react-router-dom';

export function DepouillementView() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const sequenceId = searchParams.get('sequence');

  return (
    <DepouillementPage
      projectId={projectId}
      initialSequenceId={sequenceId}
    />
  );
}
```

### Navigation dans les composants

#### Depuis ProjectList
```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate(`/projects/${projectId}/planning`);
```

#### Depuis KanbanBoard (vers Dépouillement)
```typescript
// Via le prop onOpenDepouillement
onOpenDepouillement(sequenceId);
```

#### Navigation entre onglets
```typescript
// Utilise NavLink dans ProjectLayout
<NavLink to={`/projects/${projectId}/planning`}>Planning</NavLink>
<NavLink to={`/projects/${projectId}/depouillement`}>Dépouillement</NavLink>
```

---

## 🎨 UX et navigation

### Breadcrumbs conceptuels
```
Projets > [Nom du projet] > Planning
Projets > [Nom du projet] > Dépouillement
```

### Navigation fluide
- **Retour aux projets** : Bouton avec icône ArrowLeft dans le header
- **Changement de vue** : Onglets cliquables avec indicateur visuel (bordure bleue)
- **Navigation contextuelle** : Depuis Planning, possibilité d'ouvrir une séquence directement dans Dépouillement

### Gestion de l'état
- URL comme source de vérité (pas de state global pour la navigation)
- Query params pour les états temporaires (séquence sélectionnée)
- Paramètres d'URL pour les états persistants (projectId)

---

## 📝 Avantages du routing

1. **URLs partageables** : Chaque vue a une URL unique
2. **Navigation navigateur** : Boutons précédent/suivant fonctionnent
3. **Deep linking** : Possibilité de bookmarker une vue spécifique
4. **Séparation des préoccupations** : Chaque route = une responsabilité
5. **Scalabilité** : Facile d'ajouter de nouvelles vues

---

## 🔄 Migration effectuée

### Avant (state-based)
```typescript
const [selectedProjectId, setSelectedProjectId] = useState(null);
const [currentView, setCurrentView] = useState('kanban');
```

### Après (route-based)
```typescript
// Navigation via React Router
navigate(`/projects/${projectId}/planning`);
navigate(`/projects/${projectId}/depouillement`);
```

### Changements principaux
- ✅ Suppression du state `selectedProjectId` dans App.tsx
- ✅ Suppression du state `currentView` dans ProjectDashboard
- ✅ Création de `ProjectLayout` pour le header commun
- ✅ Création de `PlanningView` et `DepouillementView` comme wrappers
- ✅ Utilisation de `useParams()` et `useSearchParams()`
- ✅ Suppression du prop `onBack` (navigation via NavLink)

---

**Date de migration** : 11 octobre 2025  
**Version** : FilmBoard v1.0
