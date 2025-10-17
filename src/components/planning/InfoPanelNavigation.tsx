import { CATEGORY_GROUPS } from '../categories';
import { InfoPanelCategoryDropdown } from './InfoPanelCategoryDropdown';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
}

interface InfoPanelNavigationProps {
  categories: Category[];
  activeTab: string;
  openDropdowns: Set<string>;
  onToggleDropdown: (groupName: string) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectGeneral: () => void;
}

export function InfoPanelNavigation({
  categories,
  activeTab,
  openDropdowns,
  onToggleDropdown,
  onSelectCategory,
  onSelectGeneral,
}: InfoPanelNavigationProps) {
  // Créer les groupes de catégories
  const categoryGroups = CATEGORY_GROUPS.map(group => ({
    name: `${group.icon} ${group.name}`,
    categories: categories.filter(cat => 
      group.categories.includes(cat.name)
    )
  })).filter(group => group.categories.length > 0);

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Bouton Général */}
        <button
          onClick={onSelectGeneral}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Général
        </button>

        {/* Dropdowns par groupe */}
        {categoryGroups.map((group) => (
          <InfoPanelCategoryDropdown
            key={group.name}
            group={group}
            isOpen={openDropdowns.has(group.name)}
            onToggle={(e) => {
              e.stopPropagation();
              onToggleDropdown(group.name);
            }}
            onSelectCategory={onSelectCategory}
            activeTab={activeTab}
          />
        ))}
      </div>
    </div>
  );
}
