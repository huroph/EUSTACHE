import { X, Upload } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Project {
  id?: string;
  title: string;
  scenario_file: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface ProjectModalProps {
  isOpen: boolean;
  project?: Project | null;
  onConfirm: (project: Omit<Project, 'id'>) => void;
  onClose: () => void;
}

export function ProjectModal({ isOpen, project, onConfirm, onClose }: ProjectModalProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [scenarioFile, setScenarioFile] = useState(project?.scenario_file || '');
  const [startDate, setStartDate] = useState(project?.start_date || '');
  const [endDate, setEndDate] = useState(project?.end_date || '');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Seuls les fichiers PDF sont acceptés');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (maximum 10MB)');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Vous devez être connecté pour uploader un fichier');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('scenarios')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      setScenarioFile(data.path);
      setUploadedFileName(file.name);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert("Erreur lors de l'upload du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Validation complète
    if (!title.trim() || !scenarioFile || !startDate || !endDate) {
      alert('Tous les champs sont obligatoires');
      return;
    }

    onConfirm({
      title: title.trim(),
      scenario_file: scenarioFile,
      start_date: startDate,
      end_date: endDate,
    });

    // Reset form
    setTitle('');
    setScenarioFile('');
    setStartDate('');
    setEndDate('');
    setUploadedFileName(null);
  };

  const handleClose = () => {
    setTitle(project?.title || '');
    setScenarioFile(project?.scenario_file || '');
    setStartDate(project?.start_date || '');
    setEndDate(project?.end_date || '');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {project ? 'Modifier le projet' : 'Nouveau projet'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-700 rounded text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Titre du projet *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Film Court Métrage 2025"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
          </div>

          {/* Fichier scénario */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Scénario (PDF) *
            </label>

            {scenarioFile && (
              <div className="mb-2 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Upload className="w-4 h-4" />
                  <span className="truncate">
                    {uploadedFileName || 'Fichier uploadé'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setScenarioFile('');
                    setUploadedFileName(null);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Supprimer
                </button>
              </div>
            )}

            <label className="block">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                required
              />
              <div className="cursor-pointer px-4 py-3 bg-slate-700 hover:bg-slate-600 border-2 border-dashed border-slate-600 rounded-lg text-center transition-colors">
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>Upload en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <Upload className="w-5 h-5" />
                    <span>Cliquez pour importer un PDF</span>
                  </div>
                )}
              </div>
            </label>
            <p className="mt-1 text-xs text-slate-500">
              Maximum 10MB • Format PDF uniquement
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {project ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
