import { useRef, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface CategoryGroup {
  name: string;
  categories: Category[];
}

interface DepouillementCategoryDropdownProps {
  group: CategoryGroup;
  isOpen: boolean;
  onToggle: (event: React.MouseEvent) => void;
  onSelectCategory: (categoryId: string) => void;
}

export function DepouillementCategoryDropdown({ 
  group, 
  isOpen, 
  onToggle,
  onSelectCategory 
}: DepouillementCategoryDropdownProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
  }, [isOpen]);

  return (
    <div className="relative dropdown-container">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center space-x-1"
      >
        <span>{group.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="fixed bg-slate-800 border border-slate-600 rounded-md shadow-lg py-1 min-w-[200px] max-h-[400px] overflow-y-auto z-[9999] dropdown-menu"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}
        >
          {group.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center space-x-2"
            >
              {category.color && (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
