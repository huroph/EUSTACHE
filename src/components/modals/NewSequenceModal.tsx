import { X } from 'lucide-react';

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
}

interface NewSequenceModalProps {
  isOpen: boolean;
  shootingDays: ShootingDay[];
  selectedDay: string;
  onSelectDay: (dayId: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function NewSequenceModal({
  isOpen,
  shootingDays,
  selectedDay,
  onSelectDay,
  onConfirm,
  onClose,
}: NewSequenceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Créer une séquence</h3>
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
              Jour de tournage *
            </label>
            <select
              value={selectedDay}
              onChange={e => onSelectDay(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            >
              <option value="">Sélectionnez un jour</option>
              {shootingDays.map(day => (
                <option key={day.id} value={day.id}>
                  Jour {day.day_number} - {new Date(day.date).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
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
              disabled={!selectedDay}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
