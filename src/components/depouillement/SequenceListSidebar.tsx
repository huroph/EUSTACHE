import { Search, Plus, Trash2 } from 'lucide-react';

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
}

interface Decor {
  id: string;
  name: string;
  description: string | null;
}

interface SequenceListSidebarProps {
  sequences: Sequence[];
  decors: Decor[];
  selectedSequence: Sequence | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectSequence: (sequence: Sequence) => void;
  onCreateSequence: () => void;
  onDeleteSequence: (id: string, e: React.MouseEvent) => void;
}

export function SequenceListSidebar({
  sequences,
  decors,
  selectedSequence,
  searchTerm,
  onSearchChange,
  onSelectSequence,
  onCreateSequence,
  onDeleteSequence,
}: SequenceListSidebarProps) {
  const filteredSequences = sequences.filter(s =>
    s.sequence_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.resume?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onCreateSequence}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Créer une page de dépouillement
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredSequences.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">Aucune séquence</p>
          </div>
        ) : (
          filteredSequences.map(seq => {
            const seqDecor = decors.find(d => d.id === seq.decor_id);
            const sceneDisplay = [seq.scene_part1, seq.scene_part2, seq.scene_part3]
              .filter(Boolean)
              .join(' / ') || seq.sequence_number;

            return (
              <div
                key={seq.id}
                className={`relative group mb-2 rounded-lg transition-colors ${
                  selectedSequence?.id === seq.id
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <button
                  onClick={() => onSelectSequence(seq)}
                  className="w-full text-left p-3"
                >
                  <div className="font-semibold text-sm text-white">{sceneDisplay}</div>
                  {seqDecor && (
                    <div className="text-xs mt-1 opacity-80 text-white">{seqDecor.name}</div>
                  )}
                  {seq.resume && (
                    <div className="text-xs mt-1 opacity-70 truncate text-white">{seq.resume}</div>
                  )}
                </button>
                
                <button
                  onClick={(e) => onDeleteSequence(seq.id, e)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer la séquence"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
