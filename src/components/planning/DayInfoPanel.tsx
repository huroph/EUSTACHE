import { MapPin, CloudSun, FileText } from 'lucide-react';

interface Sequence {
  id: string;
  shooting_day_id: string | null;
  status: 'to_prepare' | 'in_progress' | 'completed';
  ett_minutes: number;
  pages_count: number;
}

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
  location_global: string | null;
  weather_forecast: string | null;
  notes: string | null;
}

interface DayInfoPanelProps {
  day: ShootingDay | null;
  sequences: Sequence[];
}

export function DayInfoPanel({ day, sequences }: DayInfoPanelProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      default:
        return 'À préparer';
    }
  };

  if (!day) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-slate-500">Aucun jour sélectionné</div>
      </div>
    );
  }

  const totalETT = sequences.reduce((sum, seq) => sum + seq.ett_minutes, 0);
  const totalPages = sequences.reduce((sum, seq) => sum + seq.pages_count, 0);

  return (
    <div className="p-6">
      <div className="space-y-6">
          {/* En-tête du jour */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {day.day_number}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Jour {day.day_number}</h2>
                <p className="text-blue-100 text-sm">{formatDate(day.date)}</p>
              </div>
            </div>
          </div>

          {/* Statistiques du jour */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-xs uppercase mb-1">Séquences</div>
              <div className="text-2xl font-bold text-white">{sequences.length}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="text-slate-400 text-xs uppercase mb-1">ETT Total</div>
              <div className="text-2xl font-bold text-white">{formatTime(totalETT)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 col-span-2">
              <div className="text-slate-400 text-xs uppercase mb-1">Pages Totales</div>
              <div className="text-2xl font-bold text-white">{totalPages.toFixed(2)}</div>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Détails de la journée
            </h3>

            {/* Lieu */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400 mb-1">Lieu principal</div>
                  <div className="text-white">{day.location_global || 'Non défini'}</div>
                </div>
              </div>
            </div>

            {/* Météo */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex items-start gap-3">
                <CloudSun className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-slate-400 mb-1">Météo prévue</div>
                  <div className="text-white">{day.weather_forecast || 'Non définie'}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {day.notes && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-slate-400 mb-1">Notes</div>
                    <div className="text-white whitespace-pre-wrap">{day.notes}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Répartition par statut */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Avancement</h3>
            <div className="space-y-2">
              {(['to_prepare', 'in_progress', 'completed'] as const).map((status) => {
                const count = sequences.filter((s) => s.status === status).length;
                const percentage =
                  sequences.length > 0 ? (count / sequences.length) * 100 : 0;

                return (
                  <div
                    key={status}
                    className="bg-slate-800 rounded-lg p-3 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">{getStatusLabel(status)}</span>
                      <span className="text-sm font-semibold text-white">{count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          status === 'completed'
                            ? 'bg-green-500'
                            : status === 'in_progress'
                            ? 'bg-blue-500'
                            : 'bg-slate-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
  );
}
