import { X, Edit } from 'lucide-react';
import { DayInfoPanel } from './DayInfoPanel';
import { SequenceSummary } from './SequenceSummary';

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
  location_global: string | null;
  weather_forecast: string | null;
  notes: string | null;
}

interface Sequence {
  id: string;
  shooting_day_id: string | null;
  sequence_number: string;
  scene_part1: string | null;
  scene_part2: string | null;
  scene_part3: string | null;
  decor_id: string | null;
  int_ext: 'INT' | 'EXT' | null;
  day_night: 'Jour' | 'Nuit' | null;
  effect: string | null;
  resume: string | null;
  team: string;
  status: 'to_prepare' | 'in_progress' | 'completed';
  order_in_day: number;
  ett_minutes: number;
  pages_count: number;
  physical_location: string | null;
  pre_timing_seconds: number;
  work_plan: string | null;
  chronology: number | null;
}

interface Decor {
  id: string;
  name: string;
  description: string | null;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  order_index: number;
}

interface InfoPanelProps {
  mode: 'day' | 'sequence';
  day: ShootingDay | null;
  daySequences: Sequence[];
  selectedSequence: Sequence | null;
  decors: Decor[];
  categories: Category[];
  depouillementItems: any[]; // Items de dépouillement avec leurs catégories
  onClose?: () => void;
  onEdit?: () => void; // Nouvelle prop pour ouvrir la modal d'édition
}

export function InfoPanel({
  mode,
  day,
  daySequences,
  selectedSequence,
  decors,
  categories,
  depouillementItems,
  onClose,
  onEdit,
}: InfoPanelProps) {

  return (
    <div className="w-1/3 h-full flex flex-col bg-slate-800/50 border-l border-slate-700">
      {/* Header avec bouton fermer si mode sequence */}
      {mode === 'sequence' && selectedSequence && (
        <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-blue-400">
                {selectedSequence.sequence_number}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu scrollable - Récapitulatif en lecture seule */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'day' ? (
          <DayInfoPanel day={day} sequences={daySequences} />
        ) : (
          <SequenceSummary
            sequence={selectedSequence}
            decors={decors}
            categories={categories}
            depouillementItems={depouillementItems}
          />
        )}
      </div>
    </div>
  );
}
