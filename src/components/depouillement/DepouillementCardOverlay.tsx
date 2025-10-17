import { Save, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { SequenceFormGeneral } from './SequenceFormGeneral';

import { TeamTab } from './Tab/TeamTab';

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface Decor {
  id: string;
  name: string;
  description: string | null;
}

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

interface DepouillementCardOverlayProps {
  activeTab: string | null;
  selectedSequence: Sequence | null;
  decors: Decor[];
  categories: Category[];
  onClose: () => void;
  onUpdateSequenceField: <K extends keyof Sequence>(field: K, value: Sequence[K]) => void;
  onCreateDecor: () => void;
  onSequenceSaved?: () => void;
}

export function DepouillementCardOverlay({
  activeTab,
  selectedSequence,
  decors,
  categories,
  onClose,
  onUpdateSequenceField,
  onCreateDecor,
  onSequenceSaved
}: DepouillementCardOverlayProps) {
  const currentCategory = categories.find(c => c.id === activeTab);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Réinitialiser les états quand la séquence change ou quand l'overlay se ferme
  useEffect(() => {
    setIsSaving(false);
    setSaveSuccess(false);
  }, [selectedSequence?.id, activeTab]);

  // Réinitialiser quand l'overlay s'ouvre/ferme
  useEffect(() => {
    if (!activeTab || !selectedSequence) {
      setIsSaving(false);
      setSaveSuccess(false);
    }
  }, [activeTab, selectedSequence]);

  const handleSave = async () => {
    if (!selectedSequence) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Sauvegarder les modifications de la séquence dans Supabase
      const { error } = await supabase
        .from('sequences')
        .update({
          sequence_number: selectedSequence.sequence_number,
          scene_part1: selectedSequence.scene_part1,
          scene_part2: selectedSequence.scene_part2,
          scene_part3: selectedSequence.scene_part3,
          decor_id: selectedSequence.decor_id,
          int_ext: selectedSequence.int_ext,
          day_night: selectedSequence.day_night,
          effect: selectedSequence.effect,
          resume: selectedSequence.resume,
          team: selectedSequence.team,
          work_plan: selectedSequence.work_plan,
          chronology: selectedSequence.chronology,
          ett_minutes: selectedSequence.ett_minutes,
          pages_count: selectedSequence.pages_count,
          pre_timing_seconds: selectedSequence.pre_timing_seconds,
          physical_location: selectedSequence.physical_location,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedSequence.id);

      if (error) throw error;

      // Afficher le succès
      setSaveSuccess(true);
      
      // Callback pour rafraîchir les données dans le parent
      if (onSequenceSaved) {
        onSequenceSaved();
      }

      // Afficher un message de succès temporaire avant de fermer
      setTimeout(() => {
        setSaveSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de la séquence');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {(activeTab && selectedSequence) && (
        <>
          {/* Backdrop visuel uniquement - Ne ferme PAS la card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10"
          />

          {/* Sidebar Card - Absolute, collée à droite du parent */}
          <motion.div
            key={`sidebar-${activeTab}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 bottom-0 right-0 w-[600px] bg-slate-800 shadow-2xl flex flex-col pointer-events-auto z-30"
          >
            {/* Bouton chevron pour fermer */}
            <button
              onClick={onClose}
              className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors shadow-lg z-40"
              title="Fermer le panneau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Content scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
              {activeTab === 'general' ? (
                <div className="p-2">
                  <SequenceFormGeneral
                    sequence={selectedSequence}
                    decors={decors}
                    onUpdateField={onUpdateSequenceField}
                    onCreateDecor={onCreateDecor}
                  />
                </div>
              ) : (
                <div className="p-6 flex flex-1 min-h-0">
                  <TeamTab
                        sequenceId={selectedSequence.id}
                        sequenceName={selectedSequence.sequence_number}
                        categoryId={activeTab}
                        categoryName={currentCategory?.name || ''}
                      />
                  {/* Utiliser TeamTab pour les catégories d'équipe, CategoryTab pour les autres */}
                 
                </div>
              )}
            </div>

            {/* Save Button - Fixe en bas */}
            <div className="flex-shrink-0 p-4 border-t border-slate-700 bg-slate-800 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedSequence}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  saveSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600 disabled:cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : saveSuccess ? (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistré !
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
