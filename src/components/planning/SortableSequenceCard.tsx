import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';

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

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
}

interface SortableSequenceCardProps {
  sequence: Sequence;
  onClick: () => void;
  shootingDays: ShootingDay[];
  onChangeDayId: (sequenceId: string, newDayId: string) => void;
  onDelete?: (sequenceId: string) => void;
  depouillementItems?: any[]; // Items de dépouillement pour compter les rôles
}

export function SortableSequenceCard({ sequence, onClick, shootingDays, onChangeDayId, onDelete, depouillementItems = [] }: SortableSequenceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    setActivatorNodeRef,
  } = useSortable({ id: sequence.id });

  const [isClicking, setIsClicking] = useState(false);
  const clickStartPos = useRef<{ x: number; y: number } | null>(null);

  // Compter les rôles pour cette séquence
  const rolesCount = depouillementItems
    .filter((item: any) => item.sequence_id === sequence.id)
    .length;

  // Formater le temps
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Enregistrer la position de départ
    clickStartPos.current = { x: e.clientX, y: e.clientY };
    setIsClicking(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    // Vérifier si c'est un vrai clic (pas un drag)
    if (isClicking && clickStartPos.current) {
      const deltaX = Math.abs(e.clientX - clickStartPos.current.x);
      const deltaY = Math.abs(e.clientY - clickStartPos.current.y);
      
      // Si le mouvement est inférieur à 5px, c'est un clic
      if (deltaX < 5 && deltaY < 5) {
        onClick();
      }
    }
    
    setIsClicking(false);
    clickStartPos.current = null;
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation(); // Empêcher le clic de se propager
    const newDayId = e.target.value;
    if (newDayId && newDayId !== sequence.shooting_day_id) {
      onChangeDayId(sequence.id, newDayId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic de se propager
    if (onDelete && confirm(`Supprimer la séquence ${sequence.sequence_number || 'sans numéro'} ?`)) {
      console.log('🗑️ [SORTABLE CARD] Suppression séquence:', sequence.id);
      onDelete(sequence.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 transition-colors ${
        isDragging ? 'shadow-2xl z-50' : ''
      }`}
    >
      <div className="p-4 space-y-3">
        {/* Header : Drag handle + Titre + Dropdown jour */}
        <div className="flex items-center gap-3">
          {/* Drag Handle Icon - SEUL élément draggable */}
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="text-slate-500 cursor-grab active:cursor-grabbing hover:text-blue-400 transition-colors flex-shrink-0"
            title="Glisser pour réorganiser"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Titre de la séquence - Cliquable */}
          <div 
            className="flex-1 cursor-pointer"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <h3 className={`text-lg font-bold ${sequence.sequence_number ? 'text-blue-400' : 'text-slate-500 italic'}`}>
              {sequence.sequence_number || 'Nouvelle séquence'}
            </h3>
          </div>

          {/* Status badge */}
          <span
            className={`text-xs px-2 py-1 rounded border whitespace-nowrap flex-shrink-0 ${getStatusColor(sequence.status)}`}
          >
            {getStatusLabel(sequence.status)}
          </span>

          {/* Dropdown pour changer de jour */}
          <div 
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            <select
              value={sequence.shooting_day_id || ''}
              onChange={handleDayChange}
              className="text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-300 hover:border-blue-500 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="">Non assigné</option>
              {shootingDays.map((day) => (
                <option key={day.id} value={day.id}>
                  Jour {day.day_number}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton de suppression */}
          {onDelete && (
            <button
              onClick={handleDelete}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex-shrink-0 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="Supprimer la séquence"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Infos rapides : Jour/Nuit, Temps, Rôles */}
        <div 
          className="flex items-center gap-4 text-xs text-slate-400 cursor-pointer"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          {/* Jour/Nuit */}
          {sequence.day_night && (
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${sequence.day_night === 'Jour' ? 'bg-yellow-400' : 'bg-blue-400'}`}></span>
              <span>{sequence.day_night}</span>
            </div>
          )}

          {/* Temps estimé */}
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTime(sequence.ett_minutes)}</span>
          </div>

          {/* Nombre de rôles */}
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{rolesCount} rôle{rolesCount > 1 ? 's' : ''}</span>
          </div>

          {/* Pages */}
          <div className="flex items-center gap-1 ml-auto">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{sequence.pages_count}p</span>
          </div>
        </div>
      </div>
    </div>
  );
}
