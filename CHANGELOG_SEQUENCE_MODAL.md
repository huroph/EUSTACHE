# Refonte du composant SequenceModal

## Date : 11 octobre 2025

## 🎯 Objectif
Moderniser et harmoniser le composant `SequenceModal` avec l'architecture utilisée dans `DepouillementPage`.

## ✅ Modifications apportées

### 1. Structure mise à jour
- **Avant** : Tabs fixes (Général, Décors, Rôles, Départements, Autorisations, Notes)
- **Après** : Tabs dynamiques (Général + toutes les catégories de dépouillement)

### 2. Composants réutilisés
Le modal utilise maintenant les mêmes composants que la page de dépouillement :

#### `SequenceFormGeneral`
- Formulaire d'informations générales de la séquence
- Gestion des champs : scène, décor, résumé, équipe, plan de travail
- Champs techniques : I/E, Effet, Pré-minutage, Chronologie, E.T.T., Pages
- Layout responsive (2/3 - 1/3 sur grands écrans, colonne unique sur petits écrans)

#### `CategoryTab`
- Affichage et gestion des items de dépouillement par catégorie
- Ajout/modification/suppression d'items
- Quantités et notes par item
- 26 catégories disponibles : Rôles, Costumes, Maquillage, Véhicules, Accessoires, etc.

### 3. Interface props modernisée

**Avant** :
```typescript
interface SequenceModalProps {
  sequenceId: string;
  departments: Department[];
  onClose: () => void;
  onUpdate: (sequenceId: string, updates: any) => void;
  onDelete: (sequenceId: string) => void;
}
```

**Après** :
```typescript
interface SequenceModalProps {
  sequenceId: string;
  projectId: string;           // Nouveau : pour charger les décors du projet
  onClose: () => void;
  onUpdate: () => void;         // Simplifié : juste un callback
  onDelete: (sequenceId: string) => void;
}
```

### 4. Fonctionnalités préservées
- ✅ Enregistrement des modifications
- ✅ Suppression de séquence
- ✅ Navigation par onglets
- ✅ Modal responsive
- ✅ États de chargement

### 5. Nouvelles fonctionnalités
- ✅ Accès à toutes les 26 catégories de dépouillement
- ✅ Création de décor inline (modal secondaire)
- ✅ Layout responsive du formulaire
- ✅ Affichage du nom de scène formaté (ex: "12 / A / 2")
- ✅ Icônes par catégorie dans les onglets

## 🔧 Impacts sur le code existant

### KanbanBoard.tsx
Mise à jour de l'utilisation du modal :

**Avant** :
```tsx
<SequenceModal
  sequenceId={selectedSequence}
  departments={departments}
  onClose={() => { ... }}
  onUpdate={updateSequence}
  onDelete={deleteSequence}
/>
```

**Après** :
```tsx
<SequenceModal
  sequenceId={selectedSequence}
  projectId={projectId}
  onClose={() => { ... }}
  onUpdate={() => loadData()}
  onDelete={(id) => { ... }}
/>
```

### Fonctions supprimées
- `updateSequence()` dans KanbanBoard - n'est plus nécessaire, le modal gère tout

## 📊 Architecture de données

Le modal accède maintenant aux mêmes tables que DepouillementPage :

```
sequences (table principale)
  ├── decors (via decor_id FK)
  ├── shooting_days (via shooting_day_id FK)
  └── depouillement_categories
        └── depouillement_items
              └── sequence_depouillement (table de jonction)
```

## 🎨 Interface utilisateur

### Onglet Général
- Formulaire à 2 colonnes (sur grands écrans)
- Champs groupés logiquement
- Validation en temps réel

### Onglets Catégories (x26)
- Liste des items affectés à la séquence
- Bouton "Ajouter" pour sélectionner des items existants
- Bouton "Créer" pour créer de nouveaux items
- Modification de quantité et notes
- Suppression d'items

## 🚀 Avantages

1. **Cohérence** : Même UX entre Kanban et Dépouillement
2. **Maintenance** : Code partagé, moins de duplication
3. **Évolutivité** : Ajout facile de nouvelles catégories
4. **Performance** : Chargement optimisé des données
5. **Flexibilité** : Layout responsive adaptatif

## 📝 Notes techniques

### Gestion des catégories
Les catégories sont chargées dynamiquement depuis la base de données :
```typescript
const { data: catData } = await supabase
  .from('depouillement_categories')
  .select('*')
  .order('order_index');
```

### Affichage du nom de scène
```typescript
const sceneDisplay = [
  sequence.scene_part1, 
  sequence.scene_part2, 
  sequence.scene_part3
]
  .filter(Boolean)
  .join(' / ') || sequence.sequence_number;
```

### Modal imbriqué pour création de décor
```typescript
{showNewDecorModal && (
  <div className="fixed inset-0 bg-black/70 ... z-[60]">
    {/* Formulaire de création */}
  </div>
)}
```

## 🔮 Évolutions futures possibles

- [ ] Ajout d'un historique des modifications
- [ ] Duplication de séquence
- [ ] Export PDF de la fiche de dépouillement
- [ ] Suggestions intelligentes d'items selon le décor/scène
- [ ] Statistiques par catégorie (budget, durée, etc.)
- [ ] Validation par département avec workflow d'approbation

## ✨ Compatibilité

- ✅ Compatible avec toutes les données existantes
- ✅ Migration transparente (pas de changement de schéma BDD)
- ✅ Fonctionnalités Kanban préservées
- ✅ Responsive (desktop, tablette, mobile)
