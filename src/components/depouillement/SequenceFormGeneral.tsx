import { Plus } from 'lucide-react';

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

interface Decor {
  id: string;
  name: string;
  description: string | null;
}

interface SequenceFormGeneralProps {
  sequence: Sequence;
  decors: Decor[];
  onUpdateField: <K extends keyof Sequence>(field: K, value: Sequence[K]) => void;
  onCreateDecor: () => void;
}

export function SequenceFormGeneral({
  sequence,
  decors,
  onUpdateField,
  onCreateDecor,
}: SequenceFormGeneralProps) {
  // Formater le temps en mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Formater l'E.T.T. en hh:mm
  const formatETT = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-3xl">📋</span>
        Informations Générales
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Colonne gauche - 2/3 */}
        <div className="xl:col-span-3 space-y-4">
          {/* Numéro de séquence (titre principal) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Numéro de séquence <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sequence.sequence_number || ''}
              onChange={e => onUpdateField('sequence_number', e.target.value)}
              placeholder="Ex: 12, 12A, 12A2, etc."
              required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Ce numéro identifie la séquence (ex: 1, 2A, 15B, etc.)
            </p>
          </div>

          {/* Scène (optionnel, pour référence) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Référence scène (optionnel)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sequence.scene_part1 || ''}
                onChange={e => onUpdateField('scene_part1', e.target.value)}
                placeholder="12"
                className="w-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400">/</span>
              <input
                type="text"
                value={sequence.scene_part2 || ''}
                onChange={e => onUpdateField('scene_part2', e.target.value)}
                placeholder="A"
                className="w-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400">/</span>
              <input
                type="text"
                value={sequence.scene_part3 || ''}
                onChange={e => onUpdateField('scene_part3', e.target.value)}
                placeholder="2"
                className="w-16 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Décor */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Décor
            </label>
            <div className="flex gap-2">
              <select
                value={sequence.decor_id || ''}
                onChange={e => onUpdateField('decor_id', e.target.value || null)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selectionné</option>
                {decors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={onCreateDecor}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                title="Créer un décor"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lieu de tournage */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lieu de tournage
            </label>
            <input
              type="text"
              value={sequence.physical_location || ''}
              onChange={e => onUpdateField('physical_location', e.target.value || null)}
              placeholder="Adresse ou nom du lieu..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Résumé */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Résumé
            </label>
            <textarea
              value={sequence.resume || ''}
              onChange={e => onUpdateField('resume', e.target.value)}
              rows={4}
              placeholder="Description de la scène..."
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Équipe */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Équipe
            </label>
            <select
              value={sequence.team}
              onChange={e => onUpdateField('team', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MAIN UNIT">MAIN UNIT</option>
              <option value="2ND UNIT">2ND UNIT</option>
              <option value="3RD UNIT">3RD UNIT</option>
            </select>
          </div>

          {/* Plan de travail */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Plan de travail
            </label>
            <select
              value={sequence.work_plan || ''}
              onChange={e => onUpdateField('work_plan', e.target.value || null)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Insérer dans le dernier jour</option>
              <option value="manual">Placement manuel</option>
            </select>
          </div>
        </div>

        {/* Colonne droite - 1/3 */}
        <div className="xl:col-span-2 space-y-4">
          {/* I/E */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              I/E
            </label>
            <select
              value={sequence.int_ext || ''}
              onChange={e => onUpdateField('int_ext', e.target.value as any || null)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">INT</option>
              <option value="INT">INT</option>
              <option value="EXT">EXT</option>
            </select>
          </div>

          {/* Effet */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Effet
            </label>
            <select
              value={sequence.day_night || ''}
              onChange={e => onUpdateField('day_night', e.target.value as any || null)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">JOUR</option>
              <option value="Jour">JOUR</option>
              <option value="Nuit">NUIT</option>
            </select>
          </div>

          {/* Pré-minutage */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Pré-minutage (mm:ss)
            </label>
            <input
              type="text"
              value={formatTime(sequence.pre_timing_seconds)}
              onChange={e => {
                const parts = e.target.value.split(':');
                if (parts.length === 2) {
                  const mins = parseInt(parts[0]) || 0;
                  const secs = parseInt(parts[1]) || 0;
                  onUpdateField('pre_timing_seconds', mins * 60 + secs);
                }
              }}
              placeholder="00:00"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Chronologie */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Chronologie
            </label>
            <input
              type="number"
              value={sequence.chronology || ''}
              onChange={e => onUpdateField('chronology', parseInt(e.target.value) || null)}
              placeholder="Ordre"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* E.T.T. */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              E.T.T. (hh:mm)
            </label>
            <input
              type="text"
              value={formatETT(sequence.ett_minutes)}
              onChange={e => {
                const parts = e.target.value.split(':');
                if (parts.length === 2) {
                  const hours = parseInt(parts[0]) || 0;
                  const mins = parseInt(parts[1]) || 0;
                  onUpdateField('ett_minutes', hours * 60 + mins);
                }
              }}
              placeholder="00:00"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pages */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Pages (décimal)
            </label>
            <input
              type="number"
              step="0.125"
              value={sequence.pages_count}
              onChange={e => onUpdateField('pages_count', parseFloat(e.target.value) || 0)}
              placeholder="0.125"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
