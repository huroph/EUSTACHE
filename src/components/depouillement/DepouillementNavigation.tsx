import { DepouillementSidebar } from './DepouillementSidebar';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
}

interface DepouillementNavigationProps {
  categories: Category[];
  activeTab: string | null;
  openDropdowns: Set<string>;
  onToggleDropdown: (groupName: string, event: React.MouseEvent) => void;
  onSelectCategory: (categoryId: string) => void;
  onSelectGeneral: () => void;
  onCloseDropdowns?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DepouillementNavigation({
  categories,
  activeTab,
  onSelectCategory,
  onSelectGeneral,
  isCollapsed = false,
  onToggleCollapse
}: DepouillementNavigationProps) {
  return (
    <DepouillementSidebar
      categories={categories}
      activeTab={activeTab}
      onSelectCategory={onSelectCategory}
      onSelectGeneral={onSelectGeneral}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
    />
  );
}
