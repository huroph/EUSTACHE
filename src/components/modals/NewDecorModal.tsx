import { X } from 'lucide-react';

interface NewDecorModalProps {
  isOpen: boolean;
  decorName: string;
  onDecorNameChange: (name: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function NewDecorModal({
  isOpen,
  decorName,
  onDecorNameChange,
  onConfirm,
  onClose,
}: NewDecorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Créer un décor</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom du décor
            </label>
            <input
              type="text"
              value={decorName}
              onChange={e => onDecorNameChange(e.target.value)}
              placeholder="Ex: Appartement, Rue, Bureau..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
