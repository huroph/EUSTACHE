import { Plus } from 'lucide-react';
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
  DragOverlay
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  arrayMove 
} from '@dnd-kit/sortable';
import { DaySection } from './DaySection';

interface SequencesListProps {
  shootingDays: any[];
  sequences: any[];
  dayRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  depouillementItems?: any[];
  onSequenceClick: (sequenceId: string) => void;
  onAddSequence: (dayId: string) => void;
  onAddDay: () => void;
  onDeleteDay: (dayId: string) => void;
  onEditDay?: (dayId: string) => void;
  onDeleteSequence?: (sequenceId: string) => void;
  onReorderSequences: (dayId: string, sequences: any[]) => void;
  onChangeDayId: (sequenceId: string, newDayId: string) => void;
  onMoveSequenceBetweenDays: (sequenceId: string, fromDayId: string, toDayId: string, newIndex: number) => void;
}

export function SequencesList({
  shootingDays,
  sequences,
  onSequenceClick,
  onAddSequence,
  onAddDay,
  onDeleteDay,
  onEditDay,
  onDeleteSequence,
  onReorderSequences,
  onChangeDayId,
  onMoveSequenceBetweenDays,
  dayRefs,
  depouillementItems = [],
}: SequencesListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const getSequencesByDay = (dayId: string) => {
    return sequences
      .filter((s) => s.shooting_day_id === dayId)
      .sort((a, b) => a.order_in_day - b.order_in_day);
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
      
      onMoveSequenceBetweenDays(activeId, activeDayId, toDayId, 0);
      return;
    }

    const activeDayId = findSequenceDayId(activeId);
    const overDayId = findSequenceDayId(overId);

    if (!activeDayId || !overDayId) return;

    // Cas 2: Réorganisation dans le même jour
    if (activeDayId === overDayId) {
      const daySequences = getSequencesByDay(activeDayId);
      const oldIndex = daySequences.findIndex((s) => s.id === activeId);
      const newIndex = daySequences.findIndex((s) => s.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      console.log('🔄 BEFORE reorder:', { 
        oldIndex, 
        newIndex,
        sequences: daySequences.map(s => `${s.sequence_number}[${s.id.slice(0,8)}]`)
      });

      // Utiliser arrayMove de @dnd-kit pour garantir le bon ordre
      const reorderedSequences = arrayMove(daySequences, oldIndex, newIndex);

      // Mettre à jour UNIQUEMENT order_in_day
      const updatedSequences = reorderedSequences.map((seq, index) => ({
        ...seq,
        order_in_day: index,
      }));

      console.log('🔄 AFTER reorder:', { 
        sequences: updatedSequences.map(s => `${s.sequence_number}[${s.order_in_day}]`)
      });
      
      onReorderSequences(activeDayId, updatedSequences);
      return;
    }

    // Cas 3: Déplacement vers un autre jour
    const overSequences = getSequencesByDay(overDayId);
    const overIndex = overSequences.findIndex((s) => s.id === overId);

    if (overIndex !== -1) {
      console.log('🔀 Drag between days:', { from: activeDayId, to: overDayId, index: overIndex });
      onMoveSequenceBetweenDays(activeId, activeDayId, overDayId, overIndex);
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
      <div className="w-2/3 h-full overflow-y-auto border-r border-slate-700">
        <div className="p-6 space-y-8">
          {shootingDays.map((day) => (
            <SortableContext
              key={day.id}
              items={getSequencesByDay(day.id).map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <DaySection
                day={day}
                sequences={getSequencesByDay(day.id)}
                shootingDays={shootingDays}
                onSequenceClick={onSequenceClick}
                onAddSequence={onAddSequence}
                onDeleteDay={onDeleteDay}
                onEditDay={onEditDay}
                onDeleteSequence={onDeleteSequence}
                onChangeDayId={onChangeDayId}
                dayRef={(el) => (dayRefs.current[day.id] = el)}
                depouillementItems={depouillementItems}
              />
            </SortableContext>
          ))}

          {/* Bouton ajouter jour */}
          <button
            onClick={onAddDay}
            className="w-full py-4 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-lg text-slate-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter un jour de tournage
          </button>
        </div>
      </div>

      {/* DragOverlay pour un meilleur feedback visuel */}
      <DragOverlay>
        {activeSequence ? (
          <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-4 shadow-2xl opacity-90">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-semibold text-blue-400">
                {activeSequence.sequence_number}
              </span>
              <span className="text-sm text-slate-300">
                {activeSequence.scene_part1 || 'Séquence'}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
