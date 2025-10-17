import { Plus, Trash2, Edit } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableSequenceCard } from './SortableSequenceCard';

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
}

interface DaySectionProps {
  day: {
    id: string;
    day_number: number;
    date: string;
  };
  sequences: Sequence[];
  shootingDays: { id: string; day_number: number; date: string }[];
  onSequenceClick: (sequenceId: string) => void;
  onAddSequence: (dayId: string) => void;
  onDeleteDay?: (dayId: string) => void;
  onEditDay?: (dayId: string) => void;
  onDeleteSequence?: (sequenceId: string) => void;
  onChangeDayId: (sequenceId: string, newDayId: string) => void;
  dayRef: (el: HTMLDivElement | null) => void;
  depouillementItems?: any[]; // Items de dépouillement
}

export function DaySection({
  day,
  sequences,
  shootingDays,
  onSequenceClick,
  onAddSequence,
  onDeleteDay,
  onEditDay,
  onDeleteSequence,
  onChangeDayId,
  dayRef,
  depouillementItems = [],
}: DaySectionProps) {
  // Zone droppable pour les jours vides
  const { setNodeRef, isOver } = useDroppable({
    id: `day-droppable-${day.id}`,
    data: {
      type: 'day',
      dayId: day.id,
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div ref={dayRef} data-day-id={day.id} className="space-y-4 group">
      {/* Header du jour */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-900 py-2 z-10 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {day.day_number}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Jour {day.day_number}</h3>
            <p className="text-sm text-slate-400">{formatDate(day.date)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEditDay && (
            <button
              onClick={() => onEditDay(day.id)}
              className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Modifier la date"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDeleteDay && (
            <button
              onClick={() => {
                const message = sequences.length > 0
                  ? `Supprimer le Jour ${day.day_number} et ses ${sequences.length} séquence(s) ?`
                  : `Supprimer le Jour ${day.day_number} ?`;
                if (confirm(message)) {
                  onDeleteDay(day.id);
                }
              }}
              className="p-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              title="Supprimer le jour"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onAddSequence(day.id)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter séquence
          </button>
        </div>
      </div>

      {/* Liste des séquences du jour */}
      <div className="space-y-3">
        {sequences.length === 0 ? (
          <div 
            ref={setNodeRef}
            className={`text-center py-12 rounded-lg border-2 border-dashed transition-colors ${
              isOver 
                ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                : 'border-slate-700 text-slate-500'
            }`}
          >
            {isOver ? 'Déposer la séquence ici' : 'Aucune séquence pour ce jour'}
          </div>
        ) : (
          sequences.map((seq) => (
            <SortableSequenceCard
              key={seq.id}
              sequence={seq}
              onClick={() => onSequenceClick(seq.id)}
              shootingDays={shootingDays}
              onChangeDayId={onChangeDayId}
              onDelete={onDeleteSequence}
              depouillementItems={depouillementItems}
            />
          ))
        )}
      </div>
    </div>
  );
}
