import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { SequencesList } from './SequencesList';
import { InfoPanel } from './InfoPanel';
import { NewShootingDayModal, EditShootingDayModal } from '../modals';
import { createShootingDay as createDayUtil, deleteShootingDay as deleteDayUtil, updateShootingDayDate } from '../../utils/shootingDays';

interface ShootingDay {
  id: string;
  day_number: number;
  date: string;
  location_global: string | null;
  weather_forecast: string | null;
  notes: string | null;
  project_id: string;
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

interface BaguetteViewProps {
  projectId: string;
  onOpenDepouillement?: (sequenceId?: string) => void;
}

export function BaguetteView({ projectId, onOpenDepouillement }: BaguetteViewProps) {
  const [shootingDays, setShootingDays] = useState<ShootingDay[]>([]);
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [decors, setDecors] = useState<Decor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [depouillementItems, setDepouillementItems] = useState<any[]>([]); // Items de dépouillement
  const [clickedSequenceId, setClickedSequenceId] = useState<string | null>(null);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [isNewDayModalOpen, setIsNewDayModalOpen] = useState(false);
  const [editDayId, setEditDayId] = useState<string | null>(null);
  const refreshKey = 0; // Pour forcer le refresh (lecture seule maintenant)
  
  const dayRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  useEffect(() => {
    // Configurer l'IntersectionObserver pour détecter quel jour est visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayId = entry.target.getAttribute('data-day-id');
            if (dayId) {
              setActiveDayId(dayId);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -70% 0px', // Détecter quand le jour est dans le tiers supérieur
        threshold: 0,
      }
    );

    // Observer tous les jours
    Object.values(dayRefs.current).forEach((ref) => {
      if (ref && observerRef.current) {
        observerRef.current.observe(ref);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shootingDays]);

  const loadData = async () => {
    const [daysResult, sequencesResult, decorsResult, categoriesResult, itemsResult] = await Promise.all([
      supabase.from('shooting_days').select('*').eq('project_id', projectId).order('date'), // Tri par date
      supabase.from('sequences').select('*').eq('project_id', projectId).order('order_in_day'),
      supabase.from('decors').select('*').eq('project_id', projectId).order('name'),
      supabase.from('depouillement_categories').select('*').order('order_index'),
      supabase
        .from('sequence_depouillement')
        .select(`
          sequence_id,
          depouillement_items (
            id,
            name,
            category_id,
            depouillement_categories (
              id,
              name,
              icon
            )
          )
        `)
    ]);

    if (daysResult.data) {
      setShootingDays(daysResult.data);
      if (daysResult.data.length > 0 && !activeDayId) {
        setActiveDayId(daysResult.data[0].id);
      }
    }
    if (sequencesResult.data) setSequences(sequencesResult.data);
    if (decorsResult.data) setDecors(decorsResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
    if (itemsResult.data) {
      console.log('📦 BaguetteView - itemsResult loaded:', itemsResult.data);
      setDepouillementItems(itemsResult.data);
    }
    if (itemsResult.error) {
      console.error('❌ Erreur chargement items:', itemsResult.error);
    }
  };

  const handleCreateShootingDay = async (date: string) => {
    console.log('📅 [BAGUETTE] Création jour avec date:', date);
    try {
      await createDayUtil(projectId, date);
      await loadData(); // Recharger pour avoir les day_numbers mis à jour
      console.log('✅ [BAGUETTE] Jour créé et données rechargées');
    } catch (error) {
      console.error('❌ [BAGUETTE] Erreur création jour:', error);
      alert('Erreur lors de la création du jour de tournage');
    }
  };

  const handleDeleteDay = async (dayId: string) => {
    console.log('🗑️ [BAGUETTE] Suppression jour:', dayId);
    if (!confirm('Supprimer ce jour de tournage et toutes ses séquences ?')) {
      return;
    }
    try {
      await deleteDayUtil(dayId, projectId);
      await loadData(); // Recharger pour avoir les day_numbers mis à jour
      console.log('✅ [BAGUETTE] Jour supprimé et données rechargées');
    } catch (error) {
      console.error('❌ [BAGUETTE] Erreur suppression jour:', error);
      alert('Erreur lors de la suppression du jour de tournage');
    }
  };

  const handleEditDay = (dayId: string) => {
    console.log('✏️ [BAGUETTE] Ouverture édition jour:', dayId);
    setEditDayId(dayId);
  };

  const handleUpdateDay = async (newDate: string) => {
    if (!editDayId) return;
    
    console.log('📝 [BAGUETTE] Mise à jour date du jour:', editDayId, '→', newDate);
    try {
      await updateShootingDayDate(editDayId, newDate, projectId);
      await loadData(); // Recharger pour avoir les day_numbers mis à jour
      setEditDayId(null);
      console.log('✅ [BAGUETTE] Jour modifié et données rechargées');
    } catch (error) {
      console.error('❌ [BAGUETTE] Erreur modification jour:', error);
      alert('Erreur lors de la modification du jour de tournage');
    }
  };

  const createSequence = async (dayId: string) => {
    console.log('🎬 [BAGUETTE CREATE] Début création séquence - dayId:', dayId);
    
    const daySequences = sequences.filter(s => s.shooting_day_id === dayId);
    const maxOrder = daySequences.length > 0
      ? Math.max(...daySequences.map(s => s.order_in_day))
      : -1;

    console.log('📊 [BAGUETTE CREATE] Données:', {
      daySequences: daySequences.length,
      maxOrder
    });

    // Créer une séquence avec un numéro de séquence temporaire
    const { data, error } = await supabase
      .from('sequences')
      .insert({
        project_id: projectId,
        shooting_day_id: dayId,
        sequence_number: `SEQ-${sequences.length + 1}`, // Numéro temporaire
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
      console.error('❌ [BAGUETTE CREATE] Erreur:', error);
      alert('Erreur lors de la création de la séquence: ' + error.message);
      return;
    }

    if (data) {
      console.log('✅ [BAGUETTE CREATE] Séquence créée:', data.id);
      setSequences([...sequences, data]);
      
      // Ouvrir le dépouillement avec la nouvelle séquence
      if (onOpenDepouillement) {
        console.log('🚀 [BAGUETTE CREATE] Ouverture du dépouillement pour:', data.id);
        onOpenDepouillement(data.id);
      } else {
        console.warn('⚠️ [BAGUETTE CREATE] onOpenDepouillement non défini');
      }
    }
  };

  const getSequencesByDay = (dayId: string) => {
    return sequences.filter(s => s.shooting_day_id === dayId);
  };

  const handleSequenceClick = (sequenceId: string) => {
    setClickedSequenceId(sequenceId);
  };

  const handleReorderSequences = async (dayId: string, reorderedSequences: Sequence[]) => {
    console.log('📝 handleReorderSequences called:', {
      dayId,
      sequences: reorderedSequences.map(s => ({
        id: s.id.slice(0, 8),
        num: s.sequence_number,
        order: s.order_in_day
      }))
    });

    // Mettre à jour l'état local IMMÉDIATEMENT pour un feedback instantané
    setSequences(prevSequences => {
      // Garder les séquences des autres jours
      const otherDaysSequences = prevSequences.filter(s => s.shooting_day_id !== dayId);
      console.log('📦 Other days sequences:', otherDaysSequences.length);
      console.log('📦 Reordered sequences:', reorderedSequences.length);
      
      // Combiner avec les séquences réordonnées
      const newSequences = [...otherDaysSequences, ...reorderedSequences];
      console.log('📦 Total sequences after update:', newSequences.length);
      
      return newSequences;
    });

    // Puis sauvegarder dans la base de données
    console.log('💾 Updating database...');

    // Utiliser des UPDATE individuels au lieu d'upsert pour éviter les problèmes RLS
    const updatePromises = reorderedSequences.map((seq) =>
      supabase
        .from('sequences')
        .update({ order_in_day: seq.order_in_day })
        .eq('id', seq.id)
    );

    const results = await Promise.all(updatePromises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('❌ Erreur lors de la réorganisation:', errors);
      // En cas d'erreur, recharger les données
      loadData();
    } else {
      console.log('✅ Database updated successfully');
    }
  };

  const handleChangeDayId = async (sequenceId: string, newDayId: string) => {
    // Trouver la séquence
    const sequence = sequences.find(s => s.id === sequenceId);
    if (!sequence) return;

    // Calculer le nouvel order_in_day (à la fin du nouveau jour)
    const newDaySequences = sequences.filter(s => s.shooting_day_id === newDayId);
    const maxOrder = newDaySequences.length > 0
      ? Math.max(...newDaySequences.map(s => s.order_in_day))
      : -1;

    // Mettre à jour dans Supabase
    const { error } = await supabase
      .from('sequences')
      .update({
        shooting_day_id: newDayId,
        order_in_day: maxOrder + 1,
      })
      .eq('id', sequenceId);

    if (error) {
      console.error('Erreur lors du changement de jour:', error);
      return;
    }

    // Recharger les données
    await loadData();
  };

  const handleMoveSequenceBetweenDays = async (
    sequenceId: string, 
    fromDayId: string, 
    toDayId: string, 
    newIndex: number
  ) => {
    console.log('🔄 [MOVE BETWEEN DAYS] Déplacement:', { sequenceId, fromDayId, toDayId, newIndex });

    // Mettre à jour l'état local immédiatement
    setSequences(prevSequences => {
      const sequence = prevSequences.find(s => s.id === sequenceId);
      if (!sequence) return prevSequences;

      // Retirer la séquence de l'ancien jour et réorganiser
      const fromDaySeqs = prevSequences
        .filter(s => s.shooting_day_id === fromDayId && s.id !== sequenceId)
        .sort((a, b) => a.order_in_day - b.order_in_day)
        .map((s, idx) => ({ ...s, order_in_day: idx }));

      // Ajouter la séquence au nouveau jour à la position spécifiée
      const toDaySeqs = prevSequences
        .filter(s => s.shooting_day_id === toDayId)
        .sort((a, b) => a.order_in_day - b.order_in_day);

      toDaySeqs.splice(newIndex, 0, { ...sequence, shooting_day_id: toDayId, order_in_day: newIndex });
      
      const reorderedToDaySeqs = toDaySeqs.map((s, idx) => ({ ...s, order_in_day: idx }));

      // Séquences des autres jours
      const otherDaysSeqs = prevSequences.filter(
        s => s.shooting_day_id !== fromDayId && s.shooting_day_id !== toDayId
      );

      return [...otherDaysSeqs, ...fromDaySeqs, ...reorderedToDaySeqs];
    });

    // Mettre à jour la séquence déplacée dans Supabase
    const { error: moveError } = await supabase
      .from('sequences')
      .update({
        shooting_day_id: toDayId,
        order_in_day: newIndex,
      })
      .eq('id', sequenceId);

    if (moveError) {
      console.error('❌ [MOVE BETWEEN DAYS] Erreur:', moveError);
      loadData(); // Recharger en cas d'erreur
      return;
    }

    // Réorganiser les order_in_day du jour de destination
    const toDaySequences = sequences
      .filter(s => s.shooting_day_id === toDayId)
      .sort((a, b) => a.order_in_day - b.order_in_day);
    
    // Insérer la séquence déplacée à la bonne position
    const finalToDaySeqs = [...toDaySequences];
    finalToDaySeqs.splice(newIndex, 0, sequences.find(s => s.id === sequenceId)!);
    
    // Mettre à jour tous les order_in_day avec des UPDATE individuels
    const updatePromises = finalToDaySeqs.map((seq, idx) =>
      supabase
        .from('sequences')
        .update({ order_in_day: idx })
        .eq('id', seq.id)
    );

    const results = await Promise.all(updatePromises);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('❌ [MOVE BETWEEN DAYS] Erreur réorganisation:', errors);
      loadData();
    } else {
      console.log('✅ [MOVE BETWEEN DAYS] Déplacement réussi');
    }
  };

  const handleDeleteSequence = async (sequenceId: string) => {
    console.log('🗑️ [BAGUETTE DELETE] Suppression séquence:', sequenceId);
    
    // Supprimer de l'état local immédiatement
    setSequences(prevSequences => prevSequences.filter(s => s.id !== sequenceId));
    
    // Supprimer de la base de données
    const { error } = await supabase
      .from('sequences')
      .delete()
      .eq('id', sequenceId);

    if (error) {
      console.error('❌ [BAGUETTE DELETE] Erreur:', error);
      // Recharger les données en cas d'erreur
      loadData();
    } else {
      console.log('✅ [BAGUETTE DELETE] Séquence supprimée avec succès');
    }
  };

  const activeDay = shootingDays.find(d => d.id === activeDayId);
  const activeDaySequences = activeDay ? getSequencesByDay(activeDay.id) : [];
  
  // Utiliser useMemo pour forcer le recalcul quand sequences change
  const clickedSequence = useMemo(() => {
    if (!clickedSequenceId) return null;
    const found = sequences.find(s => s.id === clickedSequenceId);
    console.log('🔍 clickedSequence recalculé:', found?.sequence_number, 'roles:', found);
    return found || null;
  }, [clickedSequenceId, sequences]);

  return (
    <div className="h-full flex bg-slate-900">
      {/* Colonne gauche - 2/3 - Liste des séquences */}
      <SequencesList
        shootingDays={shootingDays}
        sequences={sequences}
        onSequenceClick={handleSequenceClick}
        onAddSequence={createSequence}
        onAddDay={() => setIsNewDayModalOpen(true)}
        onDeleteDay={handleDeleteDay}
        onEditDay={handleEditDay}
        onDeleteSequence={handleDeleteSequence}
        onReorderSequences={handleReorderSequences}
        onChangeDayId={handleChangeDayId}
        onMoveSequenceBetweenDays={handleMoveSequenceBetweenDays}
        dayRefs={dayRefs}
        depouillementItems={depouillementItems}
      />

      {/* Colonne droite - 1/3 - InfoPanel */}
      <InfoPanel
        key={refreshKey} // Forcer la re-création quand les données changent
        mode={clickedSequenceId ? 'sequence' : 'day'}
        day={activeDay || null}
        daySequences={activeDaySequences}
        selectedSequence={clickedSequence}
        decors={decors}
        categories={categories}
        depouillementItems={depouillementItems}
        onClose={() => setClickedSequenceId(null)}
        onEdit={() => {
          if (clickedSequenceId && onOpenDepouillement) {
            console.log('🖊️ [BAGUETTE] Ouverture dépouillement pour édition:', clickedSequenceId);
            onOpenDepouillement(clickedSequenceId);
          }
        }}
      />

      {/* Modal création jour de tournage */}
      <NewShootingDayModal
        isOpen={isNewDayModalOpen}
        onClose={() => setIsNewDayModalOpen(false)}
        onSubmit={handleCreateShootingDay}
        existingDates={shootingDays.map(d => d.date)}
      />

      {/* Modal édition jour de tournage */}
      {editDayId && (
        <EditShootingDayModal
          isOpen={true}
          onClose={() => setEditDayId(null)}
          onSubmit={handleUpdateDay}
          currentDate={shootingDays.find(d => d.id === editDayId)?.date || ''}
          dayNumber={shootingDays.find(d => d.id === editDayId)?.day_number || 0}
          existingDates={shootingDays.map(d => d.date)}
        />
      )}
    </div>
  );
}
