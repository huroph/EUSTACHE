import { useState } from 'react';
import { X, Calendar } from 'lucide-react';

interface NewShootingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
  existingDates?: string[]; // Pour afficher les dates déjà prises
}

export function NewShootingDayModal({ isOpen, onClose, onSubmit, existingDates = [] }: NewShootingDayModalProps) {
  const [selectedDate, setSelectedDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate) {
      onSubmit(selectedDate);
      setSelectedDate('');
      onClose();
    }
  };

  // Formater une date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Vérifier si la date est déjà utilisée
  const isDateTaken = existingDates.includes(selectedDate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Nouveau jour de tournage</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date du tournage
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
            {selectedDate && (
              <p className="mt-2 text-sm text-slate-400">
                {formatDate(selectedDate)}
              </p>
            )}
            {isDateTaken && (
              <p className="mt-2 text-sm text-yellow-400">
                ⚠️ Cette date est déjà utilisée pour un jour de tournage
              </p>
            )}
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-300">
              💡 Le numéro du jour sera calculé automatiquement en fonction de l'ordre chronologique des dates.
            </p>
          </div>

          {/* Existing dates */}
          {existingDates.length > 0 && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-sm font-medium text-slate-400 mb-2">
                Jours existants ({existingDates.length})
              </p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {existingDates
                  .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
                  .map((date, index) => (
                    <div key={date} className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-mono text-slate-600">Jour {index + 1}</span>
                      <span>•</span>
                      <span>{formatDate(date)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!selectedDate}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
