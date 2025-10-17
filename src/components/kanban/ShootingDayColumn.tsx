import { Calendar, MapPin, Plus, FileText, Trash2, Edit } from 'lucide-react';
import { SequenceCard } from './SequenceCard';

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
  location_global: string | null;
  weather_forecast: string | null;
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
  main_decor: string | null;
  resume: string | null;
  status: 'to_prepare' | 'in_progress' | 'completed';
  order_in_day: number;
}

interface ShootingDayColumnProps {
  day: ShootingDay;
  sequences: Sequence[];
  decors: Array<{ id: string; name: string }>;
  onCreateSequence: () => void;
  onSelectSequence?: (id: string) => void;
  onEditSequence?: (id: string) => void;
  onDeleteSequence?: (id: string) => void;
  onDeleteDay?: (dayId: string) => void;
  onEditDay?: (dayId: string) => void;
  onMoveSequence: (sequenceId: string, newDayId: string, newOrder: number) => void;
  onGenerateCallSheet: () => void;
}

export function ShootingDayColumn({
  day,
  sequences,
  decors,
  onCreateSequence,

  onEditSequence,
  onDeleteSequence,
  onDeleteDay,
  onEditDay,
  onMoveSequence,
  onGenerateCallSheet,
}: ShootingDayColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-slate-700/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-slate-700/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-slate-700/50');

    const sequenceId = e.dataTransfer.getData('sequenceId');
    if (sequenceId) {
      onMoveSequence(sequenceId, day.id, sequences.length);
    }
  };

  const formattedDate = new Date(day.date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="flex-shrink-0 w-80 h-full bg-slate-800 rounded-xl border border-slate-700 flex flex-col group">
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              Jour {day.day_number}
            </h3>
            {onEditDay && (
              <button
                onClick={() => onEditDay(day.id)}
                className="p-1 bg-slate-700 hover:bg-blue-600 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all"
                title="Modifier la date"
              >
                <Edit className="w-3.5 h-3.5" />
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
                className="p-1 bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all"
                title="Supprimer le jour"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
            {sequences.length} seq
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>

        {day.location_global && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="w-4 h-4" />
            <span>{day.location_global}</span>
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {sequences
          .sort((a, b) => a.order_in_day - b.order_in_day)
          .map(sequence => {
            const decorName = sequence.decor_id 
              ? decors.find(d => d.id === sequence.decor_id)?.name 
              : undefined;
            
            return (
              <SequenceCard
                key={sequence.id}
                sequence={sequence}
                onEdit={onEditSequence ? () => onEditSequence(sequence.id) : undefined}
                onDelete={onDeleteSequence ? () => onDeleteSequence(sequence.id) : undefined}
                decorName={decorName}
              />
            );
          })}
      </div>

      <div className="p-3 border-t border-slate-700 space-y-2 flex-shrink-0">
        <button
          onClick={onCreateSequence}
          className="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle séquence
        </button>
        <button
          onClick={onGenerateCallSheet}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <FileText className="w-4 h-4" />
          Feuille de service
        </button>
      </div>
    </div>
  );
}
