# Architecture de Routing - FilmBoard

## 🗺️ Structure des Routes

L'application utilise **React Router v6** pour la navigation entre les différentes vues.

### Routes principales

```
/                                    → Liste des projets
/projects/:projectId                 → Redirection automatique vers /planning
/projects/:projectId/planning        → Vue Planning/Kanban du projet
/projects/:projectId/depouillement   → Vue Dépouillement du projet
```

## 📂 Architecture des Composants

### 1. **Router Configuration** (`src/router.tsx`)

Point d'entrée du système de routing :

```typescript
export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProjectList />,
  },
  {
    path: '/projects/:projectId',
    element: <ProjectLayout />,
    children: [
      { index: true, element: <Navigate to="planning" replace /> },
      { path: 'planning', element: <PlanningView /> },
      { path: 'depouillement', element: <DepouillementView /> },
    ],
  },
]);
```

### 2. **ProjectLayout** (`src/components/projects/ProjectLayout.tsx`)

Layout parent pour toutes les vues d'un projet :

**Responsabilités :**
- Charge les données du projet depuis Supabase
- Affiche le header avec le titre du projet
- Fournit la navigation par onglets (Planning / Dépouillement)
- Utilise `<Outlet />` pour rendre les vues enfants

**Features :**
- Bouton "Retour" vers la liste des projets
- Navigation avec `NavLink` et styles actifs automatiques
- État de chargement et gestion d'erreur

### 3. **PlanningView** (`src/components/projects/PlanningView.tsx`)

Wrapper pour le KanbanBoard avec intégration routing :

**Responsabilités :**
- Récupère `projectId` depuis les paramètres d'URL
- Passe le callback `onOpenDepouillement` qui navigue vers le dépouillement
- Gère les paramètres de query pour passer l'ID de séquence

**Navigation :**
```typescript
const handleOpenDepouillement = (sequenceId?: string) => {
  if (sequenceId) {
    navigate(`/projects/${projectId}/depouillement?sequence=${sequenceId}`);
  } else {
    navigate(`/projects/${projectId}/depouillement`);
  }
};
```

### 4. **DepouillementView** (`src/components/projects/DepouillementView.tsx`)

Wrapper pour DepouillementPage avec intégration routing :

**Responsabilités :**
- Récupère `projectId` depuis les paramètres d'URL
- Lit le paramètre `?sequence=xxx` pour ouvrir une séquence spécifique
- Utilise `useSearchParams` pour les query parameters

**Exemple d'URL :**
```
/projects/abc123/depouillement?sequence=xyz789
```

### 5. **ProjectList** (`src/components/projects/ProjectList.tsx`)

Liste des projets avec navigation :

**Modifications apportées :**
- Suppression de la prop `onSelectProject`
- Utilisation de `useNavigate()` pour la navigation programmatique
- Clic sur "Ouvrir le projet" → `navigate(\`/projects/${projectId}/planning\`)`

## 🎯 Flux de Navigation

### Scénario 1 : Ouverture d'un projet

```
1. User clique sur "Ouvrir le projet" dans ProjectList
   ↓
2. Navigation vers /projects/:projectId/planning
   ↓
3. ProjectLayout charge les données du projet
   ↓
4. PlanningView affiche le KanbanBoard
```

### Scénario 2 : Accès au dépouillement depuis le Kanban

```
1. User clique sur "Modifier" une séquence dans KanbanBoard
   ↓
2. onOpenDepouillement(sequenceId) appelé
   ↓
3. Navigation vers /projects/:projectId/depouillement?sequence=xxx
   ↓
4. DepouillementView récupère le sequenceId et l'ouvre automatiquement
```

### Scénario 3 : Navigation via onglets

```
1. User clique sur l'onglet "Dépouillement" dans ProjectLayout
   ↓
2. NavLink navigue vers /projects/:projectId/depouillement
   ↓
3. Pas de rechargement de page, navigation SPA instantanée
   ↓
4. L'onglet actif est mis en surbrillance automatiquement
```

## 🔧 Configuration dans App.tsx

```typescript
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Auth />;

  return <RouterProvider router={router} />;
}
```

**Points clés :**
- AuthProvider englobe toute l'app
- Vérification de l'authentification avant d'accéder au router
- RouterProvider injecte le routeur configuré

## 📱 Navigation Programmatique

### Depuis n'importe quel composant

```typescript
import { useNavigate, useParams } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const goToPlanning = () => {
    navigate(`/projects/${projectId}/planning`);
  };

  const goToDepouillement = (sequenceId?: string) => {
    const url = `/projects/${projectId}/depouillement`;
    const query = sequenceId ? `?sequence=${sequenceId}` : '';
    navigate(url + query);
  };

  return (/* ... */);
}
```

## 🎨 Styles des NavLinks

Les onglets dans `ProjectLayout` utilisent une fonction pour les styles actifs :

```typescript
<NavLink
  to={`/projects/${projectId}/planning`}
  className={({ isActive }) =>
    `px-4 py-3 flex items-center gap-2 ${
      isActive
        ? 'text-blue-400 border-blue-400'  // Actif
        : 'text-slate-400 border-transparent' // Inactif
    }`
  }
>
  <Calendar className="w-4 h-4" />
  Planning
</NavLink>
```

## 🔄 Anciens vs Nouveaux Patterns

### ❌ Ancien (état local)

```typescript
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
const [currentView, setCurrentView] = useState<'kanban' | 'depouillement'>('kanban');

// Navigation via setState
<button onClick={() => setCurrentView('depouillement')}>
```

### ✅ Nouveau (routing)

```typescript
import { useNavigate, useParams } from 'react-router-dom';
const navigate = useNavigate();
const { projectId } = useParams();

// Navigation via URL
<button onClick={() => navigate(`/projects/${projectId}/depouillement`)}>
```

## 🚀 Avantages du Routing

1. **URLs partageables** : Chaque vue a une URL unique
2. **Boutons navigateur** : Back/Forward fonctionnent correctement
3. **Deep linking** : Accès direct à une vue spécifique
4. **SEO-friendly** : URLs descriptives (si SSR ajouté)
5. **État dans l'URL** : Paramètres de query pour l'état temporaire
6. **Code plus propre** : Séparation claire des responsabilités

## 📊 Diagramme de Navigation

```
                    ┌─────────────────┐
                    │  ProjectList    │
                    │      (/)        │
                    └────────┬────────┘
                             │
                    Clic "Ouvrir projet"
                             │
                             ▼
                    ┌─────────────────┐
                    │ ProjectLayout   │
                    │ /projects/:id   │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  PlanningView    │  │ DepouillementView│
         │    /planning     │  │  /depouillement  │
         │                  │  │                  │
         │  ┌────────────┐  │  │  ┌────────────┐ │
         │  │ KanbanBoard│  │  │  │Depouillement│ │
         │  └────────────┘  │  │  │    Page    │ │
         └──────────────────┘  │  └────────────┘ │
                               └──────────────────┘
```

## 🔐 Protection des Routes

Actuellement, la protection se fait dans `App.tsx` :

```typescript
if (!user) return <Auth />;
return <RouterProvider router={router} />;
```

**Pour une protection plus granulaire :**

```typescript
// Créer un ProtectedRoute component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
}

// L'utiliser dans le router
{
  path: '/projects/:projectId',
  element: <ProtectedRoute><ProjectLayout /></ProtectedRoute>,
}
```

## 📝 TODO Futurs

- [ ] Ajouter une route 404 NotFound
- [ ] Implémenter un loader pour les données asynchrones
- [ ] Ajouter une route `/projects/:projectId/settings`
- [ ] Créer un breadcrumb dynamique
- [ ] Ajouter des animations de transition entre vues

---

**Date de mise à jour** : 11 octobre 2025  
**Version** : FilmBoard v2.0 (avec routing)
