import { ChevronDown } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Structure des groupes de catégories
export const CATEGORY_GROUPS = [
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

interface CategoryNavigationProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  openDropdowns: Set<string>;
  onToggleDropdown: (groupName: string, event: React.MouseEvent) => void;
  showGeneralTab?: boolean;
  onCloseDropdowns?: () => void;
}

// Composant pour les boutons dropdown avec positionnement fixe
interface DropdownButtonProps {
  group: typeof CATEGORY_GROUPS[0];
  groupCategories: Category[];
  isOpen: boolean;
  hasActiveCategory: boolean;
  activeTab: string;
  onToggle: (groupName: string, event: React.MouseEvent) => void;
  onSelectCategory: (catId: string) => void;
}

function DropdownButton({
  group,
  groupCategories,
  isOpen,
  hasActiveCategory,
  activeTab,
  onToggle,
  onSelectCategory
}: DropdownButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculer la position du dropdown quand il s'ouvre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    } else {
      setDropdownPosition(null);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => onToggle(group.name, e)}
        className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
          hasActiveCategory
            ? 'text-blue-400 border-blue-400'
            : 'text-slate-400 hover:text-slate-300 border-transparent'
        }`}
      >
        <span>{group.icon}</span>
        <span>{group.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu avec positionnement fixe (via portal) */}
      {isOpen && dropdownPosition && createPortal(
        <div
          data-category-dropdown="true"
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 9999
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl min-w-[250px] max-h-[400px] overflow-y-auto"
        >
          {groupCategories.map(cat => (
            <button
              key={cat.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory(cat.id);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg ${
                activeTab === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.icon && <span className="text-lg">{cat.icon}</span>}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}


export function CategoryNavigation({
  categories,
  activeTab,
  onTabChange,
  openDropdowns,
  onToggleDropdown,
  showGeneralTab = true,
  onCloseDropdowns,
}: CategoryNavigationProps) {
  // Grouper les catégories par groupe
  const getCategoriesByGroup = (groupName: string) => {
    const group = CATEGORY_GROUPS.find(g => g.name === groupName);
    if (!group) return [];
    return categories.filter(cat => group.categories.includes(cat.name));
  };

  return (
    <div className="border-b border-slate-700 bg-slate-850 flex-shrink-0 relative z-20" data-category-navigation>
      <div className="flex overflow-x-auto">
        {/* Onglet Général (optionnel) */}
        {showGeneralTab && (
          <button
            onClick={() => onTabChange('general')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'general'
                ? 'text-blue-400 border-blue-400'
                : 'text-slate-400 hover:text-slate-300 border-transparent'
            }`}
          >
            📋 Générale
          </button>
        )}

        {/* Menus déroulants par groupe */}
        {CATEGORY_GROUPS.map(group => {
          const groupCategories = getCategoriesByGroup(group.name);
          
          // Ne pas afficher le groupe s'il n'a pas de catégories
          if (groupCategories.length === 0) return null;
          
          const isOpen = openDropdowns.has(group.name);
          const hasActiveCategory = groupCategories.some(cat => cat.id === activeTab);

          return (
            <DropdownButton
              key={group.name}
              group={group}
              groupCategories={groupCategories}
              isOpen={isOpen}
              hasActiveCategory={hasActiveCategory}
              activeTab={activeTab}
              onToggle={onToggleDropdown}
              onSelectCategory={(catId) => {
                onTabChange(catId);
                if (onCloseDropdowns) {
                  onCloseDropdowns();
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
