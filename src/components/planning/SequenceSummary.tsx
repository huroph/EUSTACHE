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

interface SequenceSummaryProps {
  sequence: Sequence | null;
  decors: Decor[];
  categories: Category[];
  depouillementItems: any[]; // Items de dépouillement avec leurs relations
}

export function SequenceSummary({ sequence, decors, categories, depouillementItems }: SequenceSummaryProps) {
  if (!sequence) {
    return (
      <div className="p-6 text-center text-slate-400">
        Aucune séquence sélectionnée
      </div>
    );
  }



  // Filtrer les items pour cette séquence et les grouper par catégorie
  const sequenceItems = depouillementItems
    .filter((si: any) => si.sequence_id === sequence.id)
    .map((si: any) => si.depouillement_items)
    .filter(Boolean);

  console.log('🔍 SequenceSummary - sequenceItems filtrés:', sequenceItems);

  // Grouper les items par catégorie
  const itemsByCategory = categories.reduce((acc, category) => {
    acc[category.id] = sequenceItems.filter(
      (item: any) => item.category_id === category.id
    );
    return acc;
  }, {} as Record<string, any[]>);



  const getDecorName = (decorId: string | null) => {
    if (!decorId) return 'Non défini';
    const decor = decors.find(d => d.id === decorId);
    return decor?.name || 'Non défini';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}`;
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

  return (
    <div className="p-6 space-y-6 relative">
  
    

      {/* Informations Générales */}
      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Informations générales
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Statut</span>
            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(sequence.status)}`}>
              {getStatusLabel(sequence.status)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Décor</span>
            <span className="text-sm text-white">{getDecorName(sequence.decor_id)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">INT/EXT</span>
            <span className="text-sm text-white">{sequence.int_ext || 'Non défini'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Jour/Nuit</span>
            <span className="text-sm text-white">{sequence.day_night || 'Non défini'}</span>
          </div>

          {sequence.effect && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Effet</span>
              <span className="text-sm text-white">{sequence.effect}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Équipe</span>
            <span className="text-sm text-white">{sequence.team}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">ETT</span>
            <span className="text-sm text-white">{formatTime(sequence.ett_minutes)}</span>
          </div>

          <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Lieu physique</span>
              <span className="text-sm text-white">{sequence.physical_location}</span>
            </div>

          

         

          {sequence.chronology !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Chronologie</span>
              <span className="text-sm text-white">{sequence.chronology}</span>
            </div>
          )}
        </div>
      </section>

      {/* Résumé */}
      {sequence.resume && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Résumé
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {sequence.resume}
          </p>
        </section>
      )}

      {/* Plan de travail */}
      {sequence.work_plan && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Plan de travail
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {sequence.work_plan}
          </p>
        </section>
      )}

      {/* Catégories de dépouillement */}
      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Dépouillement
        </h3>
        <div className="space-y-3">
          {categories.map((category) => {
            const categoryItems = itemsByCategory[category.id] || [];
            const hasItems = categoryItems.length > 0;
            
            return (
              <div key={category.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  {category.icon && <span className="text-lg">{category.icon}</span>}
                  <span className="text-sm font-medium text-white">{category.name}</span>
                  <span className="text-xs text-slate-500 ml-auto">
                    {hasItems ? `${categoryItems.length} élément${categoryItems.length > 1 ? 's' : ''}` : 'Aucun'}
                  </span>
                </div>
                
                {hasItems ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {categoryItems.map((item: any) => (
                      <span
                        key={item.id}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-1">À compléter</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Statistiques - Sticky footer */}
      <section className="sticky bottom-0 pt-4 pb-2 border-t border-slate-700 bg-slate-800/95 backdrop-blur-sm -mx-6 px-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{formatTime(sequence.ett_minutes)}</div>
            <div className="text-xs text-slate-400 mt-1">Temps estimé</div>
          </div>
          <div className="text-center p-3 bg-slate-700/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{sequence.pages_count}</div>
            <div className="text-xs text-slate-400 mt-1">Pages</div>
          </div>
        </div>
      </section>
    </div>
  );
}
