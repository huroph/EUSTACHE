import { useState, useEffect } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  int_ext?: 'INT' | 'EXT' | '';
  day_night?: 'Jour' | 'Nuit' | '';
  effect?: string;
  main_decor?: string;
  estimated_duration?: number;
}

interface Props {
  onSelect: (preset: Preset | null) => void;
}

export function DepouillementMenu({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [editing, setEditing] = useState<Preset | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('depouillement_presets');
    if (raw) setPresets(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem('depouillement_presets', JSON.stringify(presets));
  }, [presets]);

  const addPreset = () => {
    const p: Preset = {
      id: Date.now().toString(),
      name: `Preset ${presets.length + 1}`,
      int_ext: '',
      day_night: '',
      effect: '',
      main_decor: '',
      estimated_duration: 0,
    };
    setPresets([...presets, p]);
    setEditing(p);
  };

  const savePreset = (p: Preset) => {
    setPresets(prev => prev.map(x => x.id === p.id ? p : x));
    setEditing(null);
  };

  const deletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
    onSelect(null);
  };

  const applyPreset = (p: Preset) => {
    onSelect(p);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg"
        title="Dépouillement"
      >
        <Settings className="w-4 h-4" />
        Dépouillement sections
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg p-3 z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Presets</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={addPreset}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <button
              onClick={() => onSelect(null)}
              className="w-full text-left px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200"
            >
              Aucun (manuel)
            </button>

            {presets.map(p => (
              <div key={p.id} className="p-2 bg-slate-700 rounded-lg flex items-start gap-2">
                <div className="flex-1">
                  {editing?.id === p.id ? (
                    <div className="space-y-2">
                      <input
                        value={editing.name}
                        onChange={e => setEditing({ ...editing, name: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-600 rounded"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editing.int_ext}
                          onChange={e => setEditing({ ...editing, int_ext: e.target.value as any })}
                          className="px-2 py-1 bg-slate-600 rounded"
                        >
                          <option value="">- INT/EXT -</option>
                          <option value="INT">INT</option>
                          <option value="EXT">EXT</option>
                        </select>

                        <select
                          value={editing.day_night}
                          onChange={e => setEditing({ ...editing, day_night: e.target.value as any })}
                          className="px-2 py-1 bg-slate-600 rounded"
                        >
                          <option value="">- Jour/Nuit -</option>
                          <option value="Jour">Jour</option>
                          <option value="Nuit">Nuit</option>
                        </select>
                      </div>

                      <input
                        placeholder="Effet"
                        value={editing.effect}
                        onChange={e => setEditing({ ...editing, effect: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-600 rounded"
                      />

                      <input
                        placeholder="Décor principal"
                        value={editing.main_decor}
                        onChange={e => setEditing({ ...editing, main_decor: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-600 rounded"
                      />

                      <input
                        type="number"
                        placeholder="Durée estimée"
                        value={editing.estimated_duration}
                        onChange={e => setEditing({ ...editing, estimated_duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 bg-slate-600 rounded"
                      />

                      <div className="flex gap-2 mt-2">
                        <button onClick={() => savePreset(editing)} className="px-3 py-1 bg-green-600 rounded text-white">Sauvegarder</button>
                        <button onClick={() => setEditing(null)} className="px-3 py-1 bg-slate-600 rounded text-white">Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{p.name}</div>
                        <div className="text-xs text-slate-300">{[p.int_ext, p.day_night, p.main_decor].filter(Boolean).join(' • ')}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(p)} className="px-2 py-1 bg-slate-600 rounded text-slate-200">Edit</button>
                        <button onClick={() => applyPreset(p)} className="px-2 py-1 bg-blue-600 rounded text-white">Appliquer</button>
                        <button onClick={() => deletePreset(p.id)} className="px-2 py-1 bg-red-700 rounded text-white"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
