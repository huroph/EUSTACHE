import { useState, useEffect } from 'react';
import { ChevronDown, Folder } from 'lucide-react';

// Structure des groupes de catégories
const CATEGORY_GROUPS = [
  {
    name: 'Équipe',
    icon: '👥',
    categories: ['Rôles', 'Silhouettes & Doublures Image', 'Figuration', 'Cascadeurs & Doublures Cascade', 'Conseillers Techniques']
  },
  {
    name: 'Cascades & Effets',
    icon: '💥',
    categories: ['Cascades Physiques', 'Cascades Mécaniques', 'Effets Speciaux Tournage', 'VFX']
  },
  {
    name: 'Décors & Lieux',
    icon: '🏛️',
    categories: ['Intitulés des Décors', 'Décoration']
  },
  {
    name: 'Accessoires & Props',
    icon: '🎩',
    categories: ['Accessoires', 'Armes', 'Documents Visuels']
  },
  {
    name: 'Costumes & Maquillage',
    icon: '👔',
    categories: ['Costumes', 'Maquillage & Coiffure', 'Maquillage Special']
  },
  {
    name: 'Véhicules & Animaux',
    icon: '🚗',
    categories: ['Véhicules', 'Animaux']
  },
  {
    name: 'Technique',
    icon: '🎥',
    categories: ['Caméra', 'Machinerie', 'Électriciens', 'Son & Musique']
  },
  {
    name: 'Production',
    icon: '📝',
    categories: ['Notes de Production & Régie', 'Mise en Scène']
  }
];

interface Category {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
}

interface DepouillementSidebarProps {
  categories: Category[];
  activeTab: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectGeneral: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DepouillementSidebar({
  categories,
  activeTab,
  onSelectCategory,
  onSelectGeneral,
  isCollapsed = false,
  onToggleCollapse
}: DepouillementSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(isCollapsed ? [] : CATEGORY_GROUPS.map(g => g.name))
  );

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      // Si le groupe est déjà ouvert, on le ferme
      if (prev.has(groupName)) {
        const newSet = new Set(prev);
        newSet.delete(groupName);
        return newSet;
      }
      // Sinon, on ouvre uniquement ce groupe (ferme tous les autres)
      return new Set([groupName]);
    });
  };

  const handleGroupClickWhenCollapsed = (groupName: string) => {
    // Ouvrir la sidebar
    if (onToggleCollapse) {
      onToggleCollapse();
    }
    // Fermer tous les groupes sauf celui cliqué
    setExpandedGroups(new Set([groupName]));
  };

  // Effet pour fermer tous les groupes quand la sidebar devient collapsée
  useEffect(() => {
    if (isCollapsed) {
      setExpandedGroups(new Set());
    }
  }, [isCollapsed]);

  // Grouper les catégories par groupe
  const getCategoriesByGroup = (groupName: string) => {
    const group = CATEGORY_GROUPS.find(g => g.name === groupName);
    if (!group) return [];
    return categories.filter(cat => group.categories.includes(cat.name));
  };

  // Version collapsée - seulement les icônes
  if (isCollapsed) {
    return (
      <div className="w-16 bg-slate-900 border-r border-slate-700 flex flex-col overflow-y-auto transition-all duration-300">
        {/* Onglet Général - version icône */}
        <button
          onClick={onSelectGeneral}
          className={`flex items-center justify-center p-4 text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
          title="Général"
        >
          <Folder className="w-5 h-5" />
        </button>

        {/* Groupes de catégories - version icône */}
        <div className="flex-1">
          {CATEGORY_GROUPS.map(group => {
            const groupCategories = getCategoriesByGroup(group.name);
            
            // Ne pas afficher le groupe s'il n'a pas de catégories
            if (groupCategories.length === 0) return null;
            
            const hasActiveCategory = groupCategories.some(cat => cat.id === activeTab);

            return (
              <button
                key={group.name}
                onClick={() => handleGroupClickWhenCollapsed(group.name)}
                className={`w-full flex items-center justify-center p-4 text-lg transition-colors border-b border-slate-800 ${
                  hasActiveCategory
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-850'
                }`}
                title={group.name}
              >
                {group.icon}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Version normale - sidebar complète
  return (
    <div className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col overflow-y-auto transition-all duration-300">
      {/* Onglet Général */}
      <button
        onClick={onSelectGeneral}
        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
          activeTab === 'general'
            ? 'bg-slate-700 text-white'
            : 'text-slate-300 hover:bg-slate-800'
        }`}
      >
        <Folder className="w-5 h-5" />
        <span>Général</span>
      </button>

      {/* Groupes de catégories */}
      <div className="flex-1">
        {CATEGORY_GROUPS.map(group => {
          const groupCategories = getCategoriesByGroup(group.name);
          
          // Ne pas afficher le groupe s'il n'a pas de catégories
          if (groupCategories.length === 0) return null;
          
          const isExpanded = expandedGroups.has(group.name);
          const hasActiveCategory = groupCategories.some(cat => cat.id === activeTab);

          return (
            <div key={group.name} className="border-b border-slate-800">
              {/* En-tête du groupe */}
              <button
                onClick={() => toggleGroup(group.name)}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                  hasActiveCategory
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{group.icon}</span>
                  <span>{group.name}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Catégories du groupe */}
              {isExpanded && (
                <div className="bg-slate-950">
                  {groupCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`w-full flex items-center gap-3 px-8 py-2.5 text-sm transition-colors ${
                        activeTab === cat.id
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                      }`}
                    >
                      {cat.icon && <span className="text-base">{cat.icon}</span>}
                      <span className="text-left flex-1">{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
