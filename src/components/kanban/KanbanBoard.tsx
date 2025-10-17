import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react';
import { ShootingDayColumn } from './ShootingDayColumn';
import { CallSheetGenerator } from './CallSheetGenerator';
import { NewShootingDayModal, EditShootingDayModal } from '../modals';
import { createShootingDay as createDay, updateShootingDayDate } from '../../utils/shootingDays';

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
  main_decor: string | null;
  resume: string | null;
  team: string;
  status: 'to_prepare' | 'in_progress' | 'completed';
  order_in_day: number;
}

interface Decor {
  id: string;
  name: string;
  description: string | null;
}

interface KanbanBoardProps {
  projectId: string;
  onOpenDepouillement?: (sequenceId?: string) => void;
}

export function KanbanBoard({ projectId, onOpenDepouillement }: KanbanBoardProps) {
  const [shootingDays, setShootingDays] = useState<ShootingDay[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [decors, setDecors] = useState<Decor[]>([]);
  const [callSheetDayId, setCallSheetDayId] = useState<string | null>(null);
  const [isNewDayModalOpen, setIsNewDayModalOpen] = useState(false);
  const [editDayId, setEditDayId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [daysResult, sequencesResult, decorsResult] = await Promise.all([
      supabase.from('shooting_days').select('*').eq('project_id', projectId).order('date'), // Tri par date
      supabase.from('sequences').select('*').eq('project_id', projectId).order('order_in_day'),
      supabase.from('decors').select('*').eq('project_id', projectId).order('name'),
    ]);

    if (daysResult.data) setShootingDays(daysResult.data);
    if (sequencesResult.data) setSequences(sequencesResult.data);
    if (decorsResult.data) setDecors(decorsResult.data);
  };

  const handleCreateShootingDay = async (date: string) => {
    console.log('📅 [KANBAN] Création jour avec date:', date);
    try {
      await createDay(projectId, date);
      await loadData(); // Recharger pour avoir les day_numbers mis à jour
      console.log('✅ [KANBAN] Jour créé et données rechargées');
    } catch (error) {
      console.error('❌ [KANBAN] Erreur création jour:', error);
      alert('Erreur lors de la création du jour de tournage');
    }
  };

  const handleEditDay = (dayId: string) => {
    setEditDayId(dayId);
  };

  const handleUpdateDay = async (newDate: string) => {
    if (!editDayId) return;
    
    console.log('📝 [KANBAN] Modification jour:', editDayId, 'nouvelle date:', newDate);
    try {
      await updateShootingDayDate(editDayId, newDate, projectId);
      await loadData();
      setEditDayId(null);
      console.log('✅ [KANBAN] Jour modifié et données rechargées');
    } catch (error) {
      console.error('❌ [KANBAN] Erreur modification jour:', error);
      alert('Erreur lors de la modification du jour de tournage');
    }
  };

  const createSequence = async (dayId: string) => {
    console.log('🎬 [CREATE SEQUENCE] Début - dayId:', dayId);
    
    const daySequences = sequences.filter(s => s.shooting_day_id === dayId);
    const maxOrder = daySequences.length > 0
      ? Math.max(...daySequences.map(s => s.order_in_day))
      : -1;

    const newNumber = `SEQ-${sequences.length + 1}`;
    
    console.log('📊 [CREATE SEQUENCE] Données:', {
      daySequences: daySequences.length,
      maxOrder,
      newNumber
    });

    const { data, error } = await supabase
      .from('sequences')
      .insert({
        project_id: projectId,
        shooting_day_id: dayId,
        sequence_number: newNumber,
        order_in_day: maxOrder + 1,
        team: 'MAIN UNIT',
        ett_minutes: 0,
        pages_count: 0,
        pre_timing_seconds: 0,
        status: 'to_prepare',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [CREATE SEQUENCE] Erreur:', error);
      alert('Erreur lors de la création de la séquence: ' + error.message);
      return;
    }

    if (data) {
      console.log('✅ [CREATE SEQUENCE] Séquence créée:', data.id);
      setSequences([...sequences, data]);
      
      // Ouvrir le dépouillement avec la nouvelle séquence
      if (onOpenDepouillement) {
        console.log('🚀 [CREATE SEQUENCE] Ouverture du dépouillement pour:', data.id);
        onOpenDepouillement(data.id);
      } else {
        console.warn('⚠️ [CREATE SEQUENCE] onOpenDepouillement non défini');
      }
    }
  };

  const moveSequence = async (sequenceId: string, newDayId: string, newOrder: number) => {
    const sequence = sequences.find(s => s.id === sequenceId);
    if (!sequence) return;

    const oldDayId = sequence.shooting_day_id;

    await supabase
      .from('sequences')
      .update({
        shooting_day_id: newDayId,
        order_in_day: newOrder
      })
      .eq('id', sequenceId);

    if (oldDayId) {
      const oldDaySequences = sequences
        .filter(s => s.shooting_day_id === oldDayId && s.id !== sequenceId)
        .sort((a, b) => a.order_in_day - b.order_in_day);

      for (let i = 0; i < oldDaySequences.length; i++) {
        await supabase
          .from('sequences')
          .update({ order_in_day: i })
          .eq('id', oldDaySequences[i].id);
      }
    }

    await loadData();
  };

  const deleteSequence = async (sequenceId: string) => {
    await supabase.from('sequences').delete().eq('id', sequenceId);
    loadData(); // Recharger les données après suppression
  };

  const deleteDay = async (dayId: string) => {
    // Supprimer toutes les séquences du jour
    await supabase.from('sequences').delete().eq('shooting_day_id', dayId);
    
    // Supprimer le jour
    await supabase.from('shooting_days').delete().eq('id', dayId);
    
    loadData(); // Recharger les données après suppression
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="h-full flex gap-4">
          {shootingDays.map(day => (
            <ShootingDayColumn
              key={day.id}
              day={day}
              sequences={sequences.filter(s => s.shooting_day_id === day.id)}
              decors={decors}
              onCreateSequence={() => {
                console.log('🔘 [KANBAN] Bouton Nouvelle séquence cliqué pour le jour:', day.id);
                createSequence(day.id);
              }}
              onEditSequence={onOpenDepouillement ? (id) => onOpenDepouillement(id) : undefined}
              onDeleteSequence={deleteSequence}
              onDeleteDay={deleteDay}
              onEditDay={handleEditDay}
              onMoveSequence={moveSequence}
              onGenerateCallSheet={() => setCallSheetDayId(day.id)}
            />
          ))}

          <button
            onClick={() => setIsNewDayModalOpen(true)}
            className="flex-shrink-0 w-80 h-32 border-2 border-dashed border-slate-600 rounded-xl hover:border-blue-500 hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-400"
          >
            <Plus className="w-8 h-8" />
            <span className="font-medium">Ajouter un jour</span>
          </button>
        </div>
      </div>

      {/* Modal création jour de tournage */}
      <NewShootingDayModal
        isOpen={isNewDayModalOpen}
        onClose={() => setIsNewDayModalOpen(false)}
        onSubmit={handleCreateShootingDay}
        existingDates={shootingDays.map(d => d.date)}
      />

      {/* Modal modification jour de tournage */}
      {editDayId && (
        <EditShootingDayModal
          isOpen={true}
          onClose={() => setEditDayId(null)}
          onSubmit={handleUpdateDay}
          currentDate={shootingDays.find(d => d.id === editDayId)?.date || ''}
          dayNumber={shootingDays.find(d => d.id === editDayId)?.day_number || 1}
          existingDates={shootingDays.filter(d => d.id !== editDayId).map(d => d.date)}
        />
      )}

      {/* {selectedSequence && (
        <SequenceModal
          sequenceId={selectedSequence}
          projectId={projectId}
          onClose={() => {
            setSelectedSequence(null);
            loadData();
          }}
          onUpdate={() => {
            loadData();
          }}
          onDelete={(sequenceId) => {
            deleteSequence(sequenceId);
            setSelectedSequence(null);
          }}
        />
      )} */}

      {callSheetDayId && (
        <CallSheetGenerator
          dayId={callSheetDayId}
          onClose={() => setCallSheetDayId(null)}
        />
      )}
    </div>
  );
}
