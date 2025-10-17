import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { SequenceToolbox } from './SequenceToolbox';
import { NewSequenceModal, NewDecorModal, NewShootingDayModal, EditShootingDayModal } from '../modals';
import { PDFViewer } from './PDFViewer';
import { DepouillementNavigation } from './DepouillementNavigation';
import { DepouillementCardOverlay } from './DepouillementCardOverlay';
import { ChevronLeft } from 'lucide-react';
import { createShootingDay as createDayUtil, deleteShootingDay as deleteDayUtil, updateShootingDayDate } from '../../utils/shootingDays';

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

interface DepouillementPageProps {
  projectId: string;
  initialSequenceId?: string | null;
}

export function DepouillementPage({ projectId, initialSequenceId }: DepouillementPageProps) {
  const [sequences, setSequences] = useState<Sequence[]>([]);
  const [shootingDays, setShootingDays] = useState<ShootingDay[]>([]);
  const [decors, setDecors] = useState<Decor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const [showNewDecorModal, setShowNewDecorModal] = useState(false);
  const [showNewSequenceModal, setShowNewSequenceModal] = useState(false);
  const [showNewDayModal, setShowNewDayModal] = useState(false);
  const [editDayId, setEditDayId] = useState<string | null>(null);
  const [newSequenceDay, setNewSequenceDay] = useState<string>('');
  const [newDecorName, setNewDecorName] = useState('');
  const [projectScenarioUrl, setProjectScenarioUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null); // null = pas de card ouverte
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  // Gestion des dropdowns
  const toggleDropdown = (groupName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    setOpenDropdowns(prev => {
      if (prev.has(groupName)) return new Set();
      return new Set([groupName]);
    });
  };

  const closeDropdowns = () => {
    setOpenDropdowns(new Set());
  };

  const handleSelectCategory = (category: string) => {
    setActiveTab(category);
    closeDropdowns();
  };

  // Fermer les dropdowns au clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdowns.size > 0) {
        const target = event.target as HTMLElement;
        // Vérifier si le clic est à l'intérieur de la navigation ou d'un menu dropdown
        const isInsideNavigation = target.closest('[data-category-navigation]');
        const isInsideDropdown = target.closest('[data-category-dropdown]');
        if (!isInsideNavigation && !isInsideDropdown) {
          closeDropdowns();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdowns]);

  useEffect(() => {
    loadData();
    loadProject();
  }, []);

  // Sélectionner automatiquement la séquence présélectionnée
  useEffect(() => {
    if (initialSequenceId && sequences.length > 0) {
      const seq = sequences.find(s => s.id === initialSequenceId);
      if (seq) {
        setSelectedSequence(seq);
        setActiveTab('general'); // Par défaut, ouvrir Général
      }
    }
  }, [initialSequenceId, sequences]);

  // Quand on change de séquence (pas lors de la mise à jour des champs), ouvrir Général par défaut
  const prevSequenceIdRef = useRef<string | null>(null);
  useEffect(() => {
    const currentId = selectedSequence?.id || null;
    
    // Seulement si l'ID de la séquence a vraiment changé (pas juste une mise à jour de champ)
    if (currentId !== prevSequenceIdRef.current) {
      prevSequenceIdRef.current = currentId;
      
      if (selectedSequence) {
        setActiveTab('general');
      } else {
        setActiveTab(null);
      }
    }
  }, [selectedSequence?.id]);

  const loadData = async () => {
    const [seqResult, decorResult, catResult, daysResult] = await Promise.all([
      supabase.from('sequences').select('*').eq('project_id', projectId).order('sequence_number'),
      supabase.from('decors').select('*').eq('project_id', projectId).order('name'),
      supabase.from('depouillement_categories').select('*').order('order_index'),
      supabase.from('shooting_days').select('id, day_number, date').eq('project_id', projectId).order('date'), // Tri par date
    ]);

    if (seqResult.data) setSequences(seqResult.data);
    if (decorResult.data) setDecors(decorResult.data);
    if (catResult.data) setCategories(catResult.data);
    if (daysResult.data) setShootingDays(daysResult.data);
  };

  const loadProject = async () => {
    const { data } = await supabase
      .from('projects')
      .select('scenario_file')
      .eq('id', projectId)
      .single();

    if (data?.scenario_file) {
      // Générer une URL signée temporaire (valide 1 heure)
      const { data: signedUrlData, error } = await supabase.storage
        .from('scenarios')
        .createSignedUrl(data.scenario_file, 3600); // 3600 secondes = 1 heure

      if (signedUrlData && !error) {
        setProjectScenarioUrl(signedUrlData.signedUrl);
      } else {
        console.error('Erreur génération URL signée:', error);
      }
    }
  };

  const createSequence = async () => {
    if (!newSequenceDay) {
      alert('Veuillez sélectionner un jour de tournage');
      return;
    }

    const newNumber = `SEQ-${sequences.length + 1}`;
    
    const { data } = await supabase
      .from('sequences')
      .insert({
        project_id: projectId,
        sequence_number: newNumber,
        shooting_day_id: newSequenceDay,
        team: 'MAIN UNIT',
        ett_minutes: 0,
        pages_count: 0,
        pre_timing_seconds: 0,
        status: 'to_prepare',
      })
      .select()
      .single();

    if (data) {
      setSequences([...sequences, data]);
      setSelectedSequence(data);
      setShowNewSequenceModal(false);
      setNewSequenceDay('');
    }
  };

  const deleteSequence = async (sequenceId: string) => {
    const { error } = await supabase
      .from('sequences')
      .delete()
      .eq('id', sequenceId);

    if (error) {
      console.error('Erreur suppression séquence:', error);
      alert('Erreur lors de la suppression de la séquence');
      return;
    }

    // Retirer de la liste et désélectionner si c'est la séquence active
    setSequences(sequences.filter(s => s.id !== sequenceId));
    if (selectedSequence?.id === sequenceId) {
      setSelectedSequence(null);
    }
  };

  const deleteDay = async (dayId: string) => {
    console.log('🗑️ [DEPOUILLEMENT] Suppression jour:', dayId);
    if (!confirm('Supprimer ce jour de tournage et toutes ses séquences ?')) {
      return;
    }

    try {
      await deleteDayUtil(dayId, projectId);
      await loadData(); // Recharger pour avoir les day_numbers mis à jour
      console.log('✅ [DEPOUILLEMENT] Jour supprimé et données rechargées');
    } catch (error) {
      console.error('❌ [DEPOUILLEMENT] Erreur suppression jour:', error);
      alert('Erreur lors de la suppression du jour de tournage');
    }
  };

  const handleCreateDay = async (date: string) => {
    console.log('📅 [DEPOUILLEMENT] Création jour avec date:', date);
    try {
      await createDayUtil(projectId, date);
      await loadData(); // Recharger pour avoir les day_numbers mis à jour
      console.log('✅ [DEPOUILLEMENT] Jour créé et données rechargées');
    } catch (error) {
      console.error('❌ [DEPOUILLEMENT] Erreur création jour:', error);
      alert('Erreur lors de la création du jour de tournage');
    }
  };

  const handleEditDay = (dayId: string) => {
    setEditDayId(dayId);
  };

  const handleUpdateDay = async (newDate: string) => {
    if (!editDayId) return;
    
    console.log('📝 [DEPOUILLEMENT] Modification jour:', editDayId, 'nouvelle date:', newDate);
    try {
      await updateShootingDayDate(editDayId, newDate, projectId);
      await loadData();
      setEditDayId(null);
      console.log('✅ [DEPOUILLEMENT] Jour modifié et données rechargées');
    } catch (error) {
      console.error('❌ [DEPOUILLEMENT] Erreur modification jour:', error);
      alert('Erreur lors de la modification du jour de tournage');
    }
  };

  const createDecor = async () => {
    if (!newDecorName.trim()) return;

    const { data } = await supabase
      .from('decors')
      .insert({ 
        name: newDecorName.trim(),
        project_id: projectId,
      })
      .select()
      .single();

    if (data) {
      setDecors([...decors, data]);
      if (selectedSequence) {
        setSelectedSequence({ ...selectedSequence, decor_id: data.id });
      }
      setNewDecorName('');
      setShowNewDecorModal(false);
    }
  };

  const updateField = <K extends keyof Sequence>(field: K, value: Sequence[K]) => {
    if (selectedSequence) {
      setSelectedSequence({ ...selectedSequence, [field]: value });
    }
  };

  const handleReorderSequences = async (dayId: string, reorderedSequences: Sequence[]) => {
    // Mise à jour optimiste dans l'UI
    setSequences(prev => {
      const otherSequences = prev.filter(s => s.shooting_day_id !== dayId);
      return [...otherSequences, ...reorderedSequences];
    });

    // Sauvegarder dans la base de données
    for (const seq of reorderedSequences) {
      await supabase
        .from('sequences')
        .update({ order_in_day: seq.order_in_day })
        .eq('id', seq.id);
    }
  };

  const handleMoveSequenceBetweenDays = async (
    sequenceId: string,
    _fromDayId: string,
    toDayId: string,
    newIndex: number
  ) => {
    const sequence = sequences.find(s => s.id === sequenceId);
    if (!sequence) return;

    // Récupérer les séquences du jour de destination
    const targetDaySequences = sequences
      .filter(s => s.shooting_day_id === toDayId)
      .sort((a, b) => a.order_in_day - b.order_in_day);

    // Insérer la séquence à la bonne position
    targetDaySequences.splice(newIndex, 0, { ...sequence, shooting_day_id: toDayId });

    // Recalculer les order_in_day
    const updatedTargetSequences = targetDaySequences.map((seq, index) => ({
      ...seq,
      order_in_day: index,
      shooting_day_id: toDayId,
    }));

    // Mise à jour optimiste dans l'UI
    setSequences(prev => {
      const otherSequences = prev.filter(
        s => s.id !== sequenceId && s.shooting_day_id !== toDayId
      );
      return [...otherSequences, ...updatedTargetSequences];
    });

    // Sauvegarder dans la base de données
    await supabase
      .from('sequences')
      .update({ 
        shooting_day_id: toDayId,
        order_in_day: updatedTargetSequences.find(s => s.id === sequenceId)?.order_in_day || 0
      })
      .eq('id', sequenceId);

    // Mettre à jour les order_in_day des autres séquences du jour
    for (const seq of updatedTargetSequences) {
      if (seq.id !== sequenceId) {
        await supabase
          .from('sequences')
          .update({ order_in_day: seq.order_in_day })
          .eq('id', seq.id);
      }
    }
  };

  return (
    <div className="h-full flex bg-slate-900 overflow-hidden">
      {/* Sidebar de navigation - Gauche */}
      
        <DepouillementNavigation
          categories={categories}
          activeTab={activeTab}
          openDropdowns={openDropdowns}
          onToggleDropdown={toggleDropdown}
          onSelectCategory={handleSelectCategory}
          onSelectGeneral={() => setActiveTab('general')}
          onCloseDropdowns={closeDropdowns}
          isCollapsed={!!activeTab}
          onToggleCollapse={() => setActiveTab(null)}
        />
    

      {/* Contenu principal - prend l'espace restant */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer avec overlay - Centre */}
        <div className="flex-1 relative">
          {/* PDF scrollable wrapper */}
          <div className="absolute inset-0 overflow-y-auto">
            <PDFViewer fileUrl={projectScenarioUrl} />
          </div>

          {/* Bouton pour ouvrir la card quand elle est fermée */}
          {selectedSequence && !activeTab && (
            <button
              onClick={() => setActiveTab('general')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors shadow-lg z-20"
              title="Ouvrir le panneau de détails"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Card Overlay par-dessus le PDF - absolute dans le parent relative */}
          {selectedSequence && activeTab && (
            <DepouillementCardOverlay
              activeTab={activeTab}
              selectedSequence={selectedSequence}
              decors={decors}
              categories={categories}
              onClose={() => setActiveTab(null)}
              onUpdateSequenceField={updateField}
              onCreateDecor={() => setShowNewDecorModal(true)}
              onSequenceSaved={loadData}
            />
          )}
        </div>

        {/* Toolbox Séquences - Droite */}
        <SequenceToolbox
          sequences={sequences}
          shootingDays={shootingDays}
          selectedSequence={selectedSequence}
          onSelectSequence={setSelectedSequence}
          onCreateSequence={() => setShowNewSequenceModal(true)}
          onCreateDay={() => setShowNewDayModal(true)}
          onDeleteSequence={deleteSequence}
          onDeleteDay={deleteDay}
          onEditDay={handleEditDay}
          onReorderSequences={handleReorderSequences}
          onMoveSequenceBetweenDays={handleMoveSequenceBetweenDays}
        />
      </div>

      {/* Modals */}
      <NewSequenceModal
        isOpen={showNewSequenceModal}
        shootingDays={shootingDays}
        selectedDay={newSequenceDay}
        onSelectDay={setNewSequenceDay}
        onConfirm={createSequence}
        onClose={() => {
          setShowNewSequenceModal(false);
          setNewSequenceDay('');
        }}
      />

      <NewDecorModal
        isOpen={showNewDecorModal}
        decorName={newDecorName}
        onDecorNameChange={setNewDecorName}
        onConfirm={createDecor}
        onClose={() => {
          setShowNewDecorModal(false);
          setNewDecorName('');
        }}
      />

      <NewShootingDayModal
        isOpen={showNewDayModal}
        onClose={() => setShowNewDayModal(false)}
        onSubmit={handleCreateDay}
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
    </div>
  );
}
