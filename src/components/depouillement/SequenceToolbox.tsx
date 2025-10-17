import { Plus, List, Trash2, Calendar, GripVertical, Edit } from 'lucide-react';
import { useState } from 'react';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Sequence {
  id: string;
  sequence_number: string;
  shooting_day_id: string | null;
  scene_part1: string | null;
  scene_part2: string | null;
  scene_part3: string | null;
  decor_id: string | null;
  int_ext: 'INT' | 'EXT' | null;
  day_night: 'Jour' | 'Nuit' | null;
  effect: string | null;
  resume: string | null;
  team: string;
  work_plan: string | null;
  chronology: number | null;
  ett_minutes: number;
  pages_count: number;
  pre_timing_seconds: number;
  status: 'to_prepare' | 'in_progress' | 'completed';
  physical_location: string | null;
  order_in_day: number;
}

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
}

interface SequenceToolboxProps {
  sequences: Sequence[];
  shootingDays: ShootingDay[];
  selectedSequence: Sequence | null;
  onSelectSequence: (sequence: Sequence) => void;
  onCreateSequence: () => void;
  onCreateDay?: () => void;
  onDeleteSequence?: (sequenceId: string) => void;
  onDeleteDay?: (dayId: string) => void;
  onEditDay?: (dayId: string) => void;
  onReorderSequences?: (dayId: string, sequences: Sequence[]) => void;
  onMoveSequenceBetweenDays?: (sequenceId: string, fromDayId: string, toDayId: string, newIndex: number) => void;
}

// Composant pour une zone de dépôt vide (jour sans séquences)
function EmptyDayDropZone({ dayId }: { dayId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-droppable-${dayId}`,
    data: {
      type: 'day',
      dayId: dayId,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`text-center py-4   text-xs italic ${
        isOver
          ? 'rounded-lg border-2 border-dashed border-blue-500 bg-blue-500/10 text-blue-400'
          : ' text-slate-500'
      }`}
    >
      {isOver ? 'Déposer ici' : 'Aucune séquence pour ce jour'}
    </div>
  );
}

// Composant pour une séquence draggable
function SortableSequenceItem({
  seq,
  selectedSequence,
  onSelectSequence,
  onDeleteSequence,
}: {
  seq: Sequence;
  selectedSequence: Sequence | null;
  onSelectSequence: (sequence: Sequence) => void;
  onDeleteSequence?: (sequenceId: string, sequenceDisplay: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: seq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sceneDisplay = [seq.scene_part1, seq.scene_part2, seq.scene_part3]
    .filter(Boolean)
    .join(' / ');

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteSequence) {
      onDeleteSequence(seq.id, seq.sequence_number || 'Sans numéro');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-lg ${
        selectedSequence?.id === seq.id
          ? 'bg-blue-600'
          : 'bg-slate-700'
      }`}
    >
      <button
        onClick={() => onSelectSequence(seq)}
        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-2 ${
          selectedSequence?.id === seq.id
            ? 'text-white'
            : 'hover:bg-slate-600 text-slate-200'
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>

        {/* Contenu de la séquence */}
        <div className="flex-1 min-w-0">
          {/* Numéro de séquence - titre principal */}
          <div className={`font-semibold text-sm ${
            seq.sequence_number ? 'text-current' : 'text-slate-400 italic'
          }`}>
            {seq.sequence_number || 'Nouvelle séquence'}
          </div>
          
          {/* Référence scène - sous-titre */}
          {sceneDisplay && (
            <div className="text-xs mt-0.5 opacity-75">
              Scène: {sceneDisplay}
            </div>
          )}
          
          {/* Résumé */}
          {seq.resume && (
            <div className="text-xs mt-1 opacity-60 truncate">
              {seq.resume}
            </div>
          )}
        </div>
      </button>
      
      {onDeleteSequence && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all"
          title="Supprimer la séquence"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function SequenceToolbox({
  sequences,
  shootingDays,
  selectedSequence,
  onSelectSequence,
  onCreateSequence,
  onCreateDay,
  onDeleteSequence,
  onDeleteDay,
  onEditDay,
  onReorderSequences,
  onMoveSequenceBetweenDays,
}: SequenceToolboxProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDeleteClick = (sequenceId: string, sequenceDisplay: string) => {
    if (onDeleteSequence) {
      if (confirm(`Supprimer la séquence ${sequenceDisplay} ?`)) {
        onDeleteSequence(sequenceId);
      }
    }
  };

  const handleDeleteDay = (dayId: string, dayNumber: number) => {
    if (onDeleteDay) {
      const daySequences = sequencesByDay[dayId] || [];
      const message = daySequences.length > 0
        ? `Supprimer le Jour ${dayNumber} et ses ${daySequences.length} séquence(s) ?`
        : `Supprimer le Jour ${dayNumber} ?`;
      
      if (confirm(message)) {
        onDeleteDay(dayId);
      }
    }
  };

  // Grouper les séquences par jour de tournage
  const sequencesByDay = sequences.reduce((acc, seq) => {
    const dayId = seq.shooting_day_id || 'no-day';
    if (!acc[dayId]) {
      acc[dayId] = [];
    }
    acc[dayId].push(seq);
    return acc;
  }, {} as Record<string, Sequence[]>);

  // Trier les séquences dans chaque jour par order_in_day
  Object.keys(sequencesByDay).forEach(dayId => {
    sequencesByDay[dayId].sort((a, b) => (a.order_in_day || 0) - (b.order_in_day || 0));
  });

  // Créer la liste complète de tous les jours (même vides) + séquences sans jour
  const allDayIds = [
    ...shootingDays.map(d => d.id), // Tous les jours créés
    ...(sequencesByDay['no-day'] ? ['no-day'] : []) // Ajouter 'no-day' seulement si des séquences sans jour existent
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const findSequenceDayId = (sequenceId: string): string | null => {
    const sequence = sequences.find((s) => s.id === sequenceId);
    return sequence?.shooting_day_id || null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Cas 1: Drop sur un jour vide
    if (overId.startsWith('day-droppable-')) {
      const toDayId = overId.replace('day-droppable-', '');
      const activeDayId = findSequenceDayId(activeId);
      
      if (!activeDayId || activeDayId === toDayId) return;
      
      if (onMoveSequenceBetweenDays) {
        onMoveSequenceBetweenDays(activeId, activeDayId, toDayId, 0);
      }
      return;
    }

    const activeDayId = findSequenceDayId(activeId);
    const overDayId = findSequenceDayId(overId);

    if (!activeDayId) return;

    // Cas 2: Réorganisation dans le même jour
    if (activeDayId === overDayId && overDayId) {
      if (!onReorderSequences) return;

      const daySequences = sequencesByDay[activeDayId];
      const oldIndex = daySequences.findIndex((s) => s.id === activeId);
      const newIndex = daySequences.findIndex((s) => s.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      // Utiliser arrayMove de @dnd-kit pour garantir le bon ordre
      const reorderedSequences = arrayMove(daySequences, oldIndex, newIndex);

      // Mettre à jour UNIQUEMENT order_in_day
      const updatedSequences = reorderedSequences.map((seq, index) => ({
        ...seq,
        order_in_day: index,
      }));

      onReorderSequences(activeDayId, updatedSequences);
      return;
    }

    // Cas 3: Déplacement vers un autre jour
    if (overDayId && activeDayId !== overDayId) {
      if (!onMoveSequenceBetweenDays) return;

      const overSequences = sequencesByDay[overDayId];
      const overIndex = overSequences.findIndex((s) => s.id === overId);

      if (overIndex !== -1) {
        onMoveSequenceBetweenDays(activeId, activeDayId, overDayId, overIndex);
      }
    }
  };

  // Obtenir la séquence active pour le DragOverlay
  const activeSequence = activeId ? sequences.find((s) => s.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-full w-[250px] flex flex-col bg-slate-800 border-l border-slate-700 overflow-hidden">
        {/* Header - Fixe */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <List className="w-5 h-5 text-slate-300" />
              <h2 className="text-lg font-semibold text-white">Séquences</h2>
            </div>
            <button
              onClick={onCreateSequence}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Créer une séquence"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        <p className="text-xs text-slate-400">
          {sequences.length} séquence{sequences.length !== 1 ? 's' : ''}
        </p>
      </div>

        {/* Liste des séquences groupées par jour - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 min-h-0">
          {sequences.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">Aucune séquence</p>
              <button
                onClick={onCreateSequence}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Créer la première
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {allDayIds.map(dayId => {
                const day = shootingDays.find(d => d.id === dayId);
                const daySequences = sequencesByDay[dayId] || []; // Tableau vide si pas de séquences

                return (
                  <div key={dayId}>
                    {/* En-tête du jour */}
                    <div className="sticky top-0 bg-slate-800 px-2 py-2 mb-1 border-b border-slate-600 z-10">
                      {dayId === 'no-day' ? (
                        <div className="text-xs font-semibold text-slate-400 uppercase">
                          Sans jour assigné
                        </div>
                      ) : day ? (
                        <div className="flex items-center justify-between gap-2 group">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <div className="text-xs font-semibold text-slate-300">
                              Jour {day.day_number}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(day.date)}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {onEditDay && (
                              <button
                                onClick={() => onEditDay(day.id)}
                                className="p-1 bg-slate-700 hover:bg-blue-600 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Modifier la date"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            )}
                            {onDeleteDay && (
                              <button
                                onClick={() => handleDeleteDay(day.id, day.day_number)}
                                className="p-1 bg-slate-700 hover:bg-red-600 text-slate-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all"
                                title="Supprimer le jour"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Séquences du jour avec Drag & Drop ou message vide */}
                    {daySequences.length > 0 ? (
                      <SortableContext
                        items={daySequences.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {daySequences.map(seq => (
                            <SortableSequenceItem
                              key={seq.id}
                              seq={seq}
                              selectedSequence={selectedSequence}
                              onSelectSequence={onSelectSequence}
                              onDeleteSequence={onDeleteSequence ? handleDeleteClick : undefined}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    ) : (
                      <EmptyDayDropZone dayId={dayId} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton ajouter jour de tournage - Fixe en bas */}
        {onCreateDay && (
          <div className="flex-shrink-0 p-2 border-t border-slate-700">
            <button
              onClick={onCreateDay}
              className="w-full py-3 border-2 border-dashed border-slate-600 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter un jour de tournage
            </button>
          </div>
        )}
      </div>

      {/* DragOverlay pour un meilleur feedback visuel */}
      <DragOverlay>
        {activeSequence ? (
          <div className="bg-slate-700 border-2 border-blue-500 rounded-lg p-3 shadow-2xl opacity-90 w-[230px]">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-slate-400" />
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm ${
                  activeSequence.sequence_number ? 'text-white' : 'text-slate-400 italic'
                }`}>
                  {activeSequence.sequence_number || 'Nouvelle séquence'}
                </div>
                {activeSequence.scene_part1 && (
                  <div className="text-xs text-slate-400 truncate">
                    Scène: {activeSequence.scene_part1}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
