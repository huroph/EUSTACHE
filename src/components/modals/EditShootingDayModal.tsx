import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

interface EditShootingDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
  currentDate: string;
  dayNumber: number;
  existingDates?: string[]; // Pour afficher les dates déjà prises (excluant la date actuelle)
}

export function EditShootingDayModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentDate, 
  dayNumber,
  existingDates = [] 
}: EditShootingDayModalProps) {
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(currentDate);
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedDate !== currentDate) {
      onSubmit(selectedDate);
      onClose();
    } else if (selectedDate === currentDate) {
      // Pas de changement
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

  // Vérifier si la date est déjà utilisée (en excluant la date actuelle)
  const isDateTaken = existingDates.filter(d => d !== currentDate).includes(selectedDate);
  const hasChanged = selectedDate !== currentDate;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Modifier le jour {dayNumber}</h2>
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
          {/* Date actuelle */}
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Date actuelle</p>
            <p className="text-sm text-white font-medium">{formatDate(currentDate)}</p>
          </div>

          {/* Nouvelle date picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nouvelle date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
            {selectedDate && selectedDate !== currentDate && (
              <p className="mt-2 text-sm text-slate-400">
                {formatDate(selectedDate)}
              </p>
            )}
            {isDateTaken && (
              <p className="mt-2 text-sm text-yellow-400">
                ⚠️ Cette date est déjà utilisée pour un autre jour de tournage
              </p>
            )}
          </div>

          {/* Info */}
          {hasChanged && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                💡 Les numéros de jours seront recalculés automatiquement en fonction de l'ordre chronologique.
              </p>
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
              {hasChanged ? 'Modifier' : 'Fermer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
