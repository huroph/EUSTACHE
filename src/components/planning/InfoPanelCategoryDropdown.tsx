import { ChevronDown } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface CategoryGroup {
  name: string;
  categories: Category[];
}

interface InfoPanelCategoryDropdownProps {
  group: CategoryGroup;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onSelectCategory: (categoryId: string) => void;
  activeTab: string;
}

export function InfoPanelCategoryDropdown({
  group,
  isOpen,
  onToggle,
  onSelectCategory,
  activeTab,
}: InfoPanelCategoryDropdownProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, [isOpen]);

  const isGroupActive = group.categories.some(cat => cat.id === activeTab);

  return (
    <div className="relative dropdown-container">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
          isGroupActive
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        <span>{group.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="dropdown-menu fixed bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-50 min-w-[200px]"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {group.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                activeTab === category.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
