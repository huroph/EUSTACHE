import { Sun, Moon, Droplets, Flame, Home, Edit2, Trash2 } from 'lucide-react';

interface Sequence {
  id: string;
  sequence_number: string;
  scene_part1: string | null;
  scene_part2: string | null;
  scene_part3: string | null;
  int_ext: 'INT' | 'EXT' | null;
  day_night: 'Jour' | 'Nuit' | null;
  effect: string | null;
  main_decor: string | null;
  resume: string | null;
  status: 'to_prepare' | 'in_progress' | 'completed';
}

interface SequenceCardProps {
  sequence: Sequence;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  decorName?: string;
}

const statusColors = {
  to_prepare: 'border-yellow-600 bg-yellow-900/20',
  in_progress: 'border-blue-600 bg-blue-900/20',
  completed: 'border-green-600 bg-green-900/20',
};

const statusLabels = {
  to_prepare: 'À préparer',
  in_progress: 'En cours',
  completed: 'Terminé',
};

export function SequenceCard({ sequence, onClick, onEdit, onDelete, decorName }: SequenceCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('sequenceId', sequence.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (confirm(`Supprimer la séquence ${sceneNumber || sequence.sequence_number} ?`)) {
        onDelete();
      }
    }
  };

  // Construire le numéro de scène complet
  const sceneNumber = [sequence.scene_part1, sequence.scene_part2, sequence.scene_part3]
    .filter(Boolean)
    .join(' / ');

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`p-3 rounded-lg border-l-4 ${statusColors[sequence.status]} bg-slate-750 hover:bg-slate-700 ${onClick ? 'cursor-pointer' : 'cursor-default'} transition-all group relative`}
    >
      {/* Boutons action (visibles au hover) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
        {onEdit && (
          <button
            onClick={handleEditClick}
            className="p-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded transition-colors"
            title="Éditer dans le dépouillement"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded transition-colors"
            title="Supprimer la séquence"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <span className="font-semibold text-white text-sm block">
            {sequence.sequence_number}
          </span>
          {sceneNumber && sceneNumber !== sequence.sequence_number && (
            <span className="text-xs text-slate-500">{sceneNumber}</span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {sequence.int_ext && (
            <span className="text-xs px-2 py-0.5 bg-slate-600 text-slate-200 rounded">
              {sequence.int_ext}
            </span>
          )}
          {sequence.day_night === 'Nuit' && <Moon className="w-4 h-4 text-blue-300" />}
          {sequence.day_night === 'Jour' && <Sun className="w-4 h-4 text-yellow-400" />}
        </div>
      </div>

      {/* Décor */}
      {(decorName || sequence.main_decor) && (
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-1">
          <Home className="w-3 h-3" />
          <span className="truncate">{decorName || sequence.main_decor}</span>
        </div>
      )}

      {/* Résumé */}
      {sequence.resume && (
        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{sequence.resume}</p>
      )}

      {sequence.effect && (
        <div className="flex items-center gap-1 mt-2">
          {sequence.effect.toLowerCase().includes('pluie') && (
            <Droplets className="w-3 h-3 text-blue-400" />
          )}
          {sequence.effect.toLowerCase().includes('feu') && (
            <Flame className="w-3 h-3 text-orange-400" />
          )}
          <span className="text-xs text-slate-400">{sequence.effect}</span>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-slate-600">
        <span className="text-xs text-slate-400">{statusLabels[sequence.status]}</span>
      </div>
    </div>
  );
}
