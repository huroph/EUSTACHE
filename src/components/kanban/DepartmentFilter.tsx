import { X } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  color: string;
}

interface DepartmentFilterProps {
  departments: Department[];
  selectedDepartment: string | null;
  onSelectDepartment: (id: string | null) => void;
  onClose: () => void;
}

export function DepartmentFilter({
  departments,
  selectedDepartment,
  onSelectDepartment,
  onClose,
}: DepartmentFilterProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Filtrer par département</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectDepartment(null)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedDepartment === null
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Tous
        </button>

        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() =>
              onSelectDepartment(selectedDepartment === dept.id ? null : dept.id)
            }
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              selectedDepartment === dept.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: dept.color }}
            />
            {dept.name}
          </button>
        ))}
      </div>
    </div>
  );
}
