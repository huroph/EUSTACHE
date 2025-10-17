# Structure des composants - FilmBoard

## 📁 Organisation par dossiers thématiques

```
src/components/
├── index.ts                  # Barrel export principal
├── auth/                     # 👤 Authentification
│   ├── Auth.tsx
│   └── index.ts
├── projects/                 # 📂 Gestion des projets
│   ├── ProjectList.tsx      # Liste des projets
│   ├── ProjectModal.tsx     # Modal création/édition projet
│   ├── ProjectDashboard.tsx # Dashboard principal du projet
│   └── index.ts
├── depouillement/           # 📋 Dépouillement et séquences
│   ├── DepouillementPage.tsx    # Page principale dépouillement
│   ├── DepouillementMenu.tsx    # Menu navigation
│   ├── CategoryTab.tsx          # Onglet catégorie
│   ├── SequenceFormGeneral.tsx  # Formulaire général séquence
│   ├── SequenceToolbox.tsx      # Sidebar liste séquences
│   ├── SequenceListSidebar.tsx  # Alternative sidebar
│   ├── PDFViewer.tsx            # Visionneuse PDF scénario
│   └── index.ts
├── kanban/                  # 📊 Tableau Kanban
│   ├── KanbanBoard.tsx      # Board principal
│   ├── ShootingDayColumn.tsx # Colonne jour de tournage
│   ├── SequenceCard.tsx     # Card séquence
│   ├── DepartmentFilter.tsx # Filtres départements
│   ├── CallSheetGenerator.tsx # Générateur feuille service
│   └── index.ts
└── modals/                  # 🪟 Modals génériques
    ├── SequenceModal.tsx    # Modal édition séquence (depuis Kanban)
    ├── NewSequenceModal.tsx # Modal création séquence
    ├── NewDecorModal.tsx    # Modal création décor
    └── index.ts
```

## 📦 Barrel Exports

Chaque dossier contient un fichier `index.ts` qui exporte tous ses composants :

```typescript
// Exemple: src/components/kanban/index.ts
export { KanbanBoard } from './KanbanBoard';
export { ShootingDayColumn } from './ShootingDayColumn';
export { SequenceCard } from './SequenceCard';
export { DepartmentFilter } from './DepartmentFilter';
export { CallSheetGenerator } from './CallSheetGenerator';
```

## 🔗 Imports simplifiés

### Avant (ancien système)
```typescript
import { Auth } from './components/Auth';
import { ProjectList } from './components/ProjectList';
import { KanbanBoard } from './components/KanbanBoard';
```

### Après (nouvelle structure)
```typescript
import { Auth } from './components/auth';
import { ProjectList, ProjectDashboard } from './components/projects';
import { KanbanBoard } from './components/kanban';
```

## 🎯 Avantages de cette structure

1. **Lisibilité** : Les composants sont regroupés par domaine fonctionnel
2. **Maintenance** : Plus facile de trouver et modifier des composants liés
3. **Scalabilité** : Facile d'ajouter de nouveaux composants dans les bons dossiers
4. **Imports propres** : Barrel exports simplifient les chemins d'import
5. **Séparation des préoccupations** : Chaque dossier a une responsabilité claire

## 📖 Guide d'utilisation

### Imports depuis App.tsx
```typescript
import { Auth } from './components/auth';
import { ProjectList, ProjectDashboard } from './components/projects';
```

### Imports entre composants de différents dossiers
```typescript
// Dans ProjectDashboard.tsx (projects/)
import { DepouillementPage } from '../depouillement';
import { KanbanBoard } from '../kanban';

// Dans KanbanBoard.tsx (kanban/)
import { SequenceModal } from '../modals';

// Dans SequenceModal.tsx (modals/)
import { SequenceFormGeneral, CategoryTab } from '../depouillement';
```

### Imports au sein du même dossier
```typescript
// Dans KanbanBoard.tsx (kanban/)
import { ShootingDayColumn } from './ShootingDayColumn';
import { DepartmentFilter } from './DepartmentFilter';
```

### Imports depuis lib/ ou contexts/
```typescript
// Depuis n'importe quel sous-dossier
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
```

## 🔄 Migration effectuée

- ✅ Création des dossiers thématiques
- ✅ Déplacement de tous les composants
- ✅ Création des barrel exports (index.ts)
- ✅ Mise à jour de tous les imports
- ✅ Tests de compilation

## 🎨 Conventions de nommage

- **Dossiers** : minuscules, pas de pluriel (sauf exceptions logiques)
- **Fichiers** : PascalCase pour les composants (.tsx)
- **Barrel exports** : index.ts dans chaque dossier
- **Imports** : Utiliser les barrel exports quand possible

---

**Date de migration** : 11 octobre 2025
**Version** : FilmBoard v1.0
