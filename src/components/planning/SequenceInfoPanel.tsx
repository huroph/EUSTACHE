import { SequenceFormGeneral } from '../depouillement/SequenceFormGeneral';

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
  pre_timing_seconds: number;
  work_plan: string | null;
  chronology: number | null;
  physical_location: string | null;
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

interface SequenceInfoPanelProps {
  sequence: Sequence | null;
  activeTab: string;
  decors: Decor[];
  categories: Category[];
}

export function SequenceInfoPanel({
  sequence,
  activeTab,
  decors,
}: SequenceInfoPanelProps) {
  if (!sequence) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-500">Aucune séquence sélectionnée</div>
      </div>
    );
  }

  // Cette fonction ne fait rien car on est en lecture seule
  const handleUpdateField = () => {
    // En lecture seule pour l'instant
    console.log('Modification non disponible dans cette vue');
  };

  const handleCreateDecor = () => {
    console.log('Création de décor non disponible dans cette vue');
  };

  return (
    <div className="p-6">
      {activeTab === 'general' ? (
        <SequenceFormGeneral
          sequence={sequence}
          decors={decors}
          onUpdateField={handleUpdateField}
          onCreateDecor={handleCreateDecor}
        />
      ) : (
        <div className="text-center text-slate-400 py-8">
          <p>Catégorie non disponible dans cette vue.</p>
          <p className="text-sm mt-2">Utilisez le dépouillement pour gérer les catégories.</p>
        </div>
      )}
    </div>
  );
}
