import React, { useState } from 'react';
import { X, UserCircle, Drama, Camera, Users, Wrench } from 'lucide-react';

const typeOptions = [
  { value: 'role', label: 'Rôle', icon: Drama },
  { value: 'silhouette', label: 'Silhouette', icon: UserCircle },
  { value: 'figuration', label: 'Figuration', icon: Users },
  { value: 'doublure', label: 'Doublure', icon: Camera },
  { value: 'technique', label: 'Technique', icon: Wrench },
];

const initialForm = {
  nom: '',
  type: 'role',
  sousType: '',
  personnage: '',
  description: '',
  photo: '',
  telephone: '',
  email: '',
  agence: '',
  agent: '',
  sequences: [],
  joursPresence: [],
  statut: 'attente',
  notes: '',
  costume: { tailles: '', pointure: '', notes: '' },
  maquillage: '',
  documents: { contrat: false, droitImage: false, secu: false },
  tarif: '',
  nbJours: '',
  nbPersonnes: '',
  specialites: '',
  experience: '',
  materiel: '',
  derniersFilms: [],
  certificats: '',
  vehicule: '',
  morphologie: ''
};

const CreationPersonModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState(initialForm);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectType = (type) => {
    setForm(prev => ({ ...prev, type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm(initialForm);
    onClose();
  };

  const SelectedIcon = typeOptions.find(opt => opt.value === form.type).icon;
  
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-8 relative">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:bg-slate-700 p-2 rounded-lg transition"
          onClick={onClose}
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <span className="w-10 h-10 flex items-center justify-center bg-slate-700 rounded-full border-2 border-purple-400">
            <SelectedIcon size={24} className="text-purple-400" />
          </span>
          <h2 className="text-2xl font-bold text-white">Ajouter une personne</h2>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Nom */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Nom complet</label>
            <input
              type="text"
              value={form.nom}
              onChange={e => handleChange('nom', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          {/* Type */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Type</label>
            <div className="flex gap-2">
              {typeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectType(opt.value)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                    form.type === opt.value
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-750 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <opt.icon size={14} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Personnage / Poste / Description */}
          {['role', 'silhouette', 'doublure'].includes(form.type) && (
            <div>
              <label className="block text-sm text-slate-300 mb-1">
                {form.type === 'technique' ? 'Poste' : 'Personnage'}
              </label>
              <input
                type="text"
                value={form.personnage}
                onChange={e => handleChange('personnage', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
                required={form.type !== 'figuration'}
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              rows={2}
            />
          </div>
          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Téléphone</label>
              <input
                type="text"
                value={form.telephone}
                onChange={e => handleChange('telephone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Agence</label>
              <input
                type="text"
                value={form.agence}
                onChange={e => handleChange('agence', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Agent</label>
              <input
                type="text"
                value={form.agent}
                onChange={e => handleChange('agent', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              />
            </div>
          </div>
          {/* Statut */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Statut</label>
            <select
              value={form.statut}
              onChange={e => handleChange('statut', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
            >
              <option value="confirme">Confirmé</option>
              <option value="attente">En attente</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>
          {/* Séquences (simple CSV pour début) */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Séquences</label>
            <input
              type="text"
              value={form.sequences.join(',')}
              placeholder="SEQ-1,SEQ-2,SEQ-3"
              onChange={e => handleChange('sequences', e.target.value.split(','))}
              className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
            />
          </div>
          {/* Jours de présence */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Jours de présence</label>
            <input
              type="text"
              value={form.joursPresence.join(',')}
              placeholder="Jour 1,Jour 2"
              onChange={e => handleChange('joursPresence', e.target.value.split(','))}
              className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
            />
          </div>
          {/* Tarif & Nb jours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Tarif journalier</label>
              <input
                type="text"
                value={form.tarif}
                onChange={e => handleChange('tarif', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Nombre de jours</label>
              <input
                type="number"
                value={form.nbJours}
                onChange={e => handleChange('nbJours', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              />
            </div>
          </div>
          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => handleChange('notes', e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-750 border border-slate-700 text-white"
              rows={2}
            />
          </div>
          {/* Zone boutons */}
          <div className="flex justify-end gap-2 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreationPersonModal;
