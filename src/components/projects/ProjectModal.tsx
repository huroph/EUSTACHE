import { X, Upload } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Project, CreateProjectData } from '../../api/projects';

interface ProjectModalProps {
  isOpen: boolean;
  project?: Project | null;
  onConfirm: (project: CreateProjectData) => void;
  onClose: () => void;
}


export function ProjectModal({ isOpen, project, onConfirm, onClose }: ProjectModalProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [type, setType] = useState('Documentaire');
  const [scenarioFile, setScenarioFile] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [affiche, setAffiche] = useState<string | null>(null);
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState('18/10/2025');
  const [endDate, setEndDate] = useState('18/10/2025');

  if (!isOpen) return null;

  // Handlers visuels uniquement
  const handleAfficheUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAffiche(URL.createObjectURL(file));
    }
  };
  const handleScenarioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScenarioFile(file.name);
      setUploadedFileName(file.name);
    }
  };
  const handleClose = () => {
    setTitle(project?.title || '');
    setScenarioFile('');
    setUploadedFileName(null);
    setAffiche(null);
    setType('Documentaire');
    setShowDates(false);
    setStartDate('18/10/2025');
    setEndDate('18/10/2025');
    onClose();
  };

  // Types de projet
  const typeOptions = [
    'Documentaire',
    'Fiction',
    'Clip',
    'Publicité',
    'Série',
    'Autre'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Nouveau Projet
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-700 rounded text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Affiche */}
          <div className="flex gap-4 items-start">
            <label className="flex flex-col items-center justify-center w-32 h-40 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer">
              {affiche ? (
                <img src={affiche} alt="Affiche" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Upload className="w-8 h-8 mb-2" />
                  <span>Affiche</span>
                  <span className="text-xs mt-1">Maximum 100MB</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleAfficheUpload} />
            </label>

            <div className="flex-1 space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Titre du Projet *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex : FILM Court Métrage"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type du projet</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                >
                  {typeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Scénario PDF */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Scénario (PDF) *</label>
            {scenarioFile && (
              <div className="mb-2 p-3 bg-slate-700 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Upload className="w-4 h-4" />
                  <span className="truncate">{uploadedFileName || 'Fichier uploadé'}</span>
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
              <input type="file" accept="application/pdf" onChange={handleScenarioUpload} className="hidden" />
              <div className="cursor-pointer px-4 py-3 bg-slate-700 hover:bg-slate-600 border-2 border-dashed border-slate-600 rounded-lg text-center transition-colors">
                <div className="flex items-center justify-center gap-2 text-slate-300">
                  <Upload className="w-5 h-5" />
                  <span>Cliquez pour importer un PDF</span>
                </div>
              </div>
            </label>
            <p className="mt-1 text-xs text-slate-500">Maximum 10MB • Format PDF uniquement</p>
          </div>

          {/* Dates de tournage */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-300">Date de tournage ?</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={showDates} onChange={e => setShowDates(e.target.checked)} className="sr-only" />
                <span className={`w-10 h-6 flex items-center bg-slate-700 rounded-full p-1 transition-colors ${showDates ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <span className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${showDates ? 'translate-x-4' : ''}`}></span>
                </span>
              </label>
            </div>
            {showDates && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date de Fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                  />
                </div>
              </div>
            )}
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
              onClick={() => {}}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Créer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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
