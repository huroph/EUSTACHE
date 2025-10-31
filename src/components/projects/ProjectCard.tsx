import { Film, Edit2, Trash2, Calendar, Crown, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Project } from '../../types/project.types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();

  /**
   * Formate la date au format français
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  /**
   * Obtient le badge de rôle avec l'icône et la couleur appropriée
   */
  const getRoleBadge = () => {
    if (!project.user_role) return null;

    const roleConfig = {
      owner: {
        icon: Crown,
        label: 'Propriétaire',
        bgColor: 'bg-yellow-500/10',
        textColor: 'text-yellow-500',
        borderColor: 'border-yellow-500/20'
      },
      editor: {
        icon: Edit,
        label: 'Éditeur',
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-500',
        borderColor: 'border-blue-500/20'
      },
      viewer: {
        icon: Eye,
        label: 'Lecteur',
        bgColor: 'bg-slate-500/10',
        textColor: 'text-slate-500',
        borderColor: 'border-slate-500/20'
      }
    };

    const config = roleConfig[project.user_role];
    const Icon = config.icon;

    return (
      <div
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
          ${config.bgColor} ${config.textColor} ${config.borderColor}
        `}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  };

  /**
   * Vérifie si l'utilisateur peut éditer ou supprimer
   */
  const canEdit = project.user_role === 'owner' || project.user_role === 'editor';
  const canDelete = project.user_role === 'owner';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-all group">
      {/* Image de preview ou placeholder */}
      <div
        onClick={() => navigate(`/projects/${project.id}`)}
        className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center cursor-pointer relative overflow-hidden group-hover:from-slate-600 group-hover:to-slate-700 transition-all"
      >
        <Film className="w-16 h-16 text-slate-600 group-hover:scale-110 transition-transform" />
        
        {/* Badge de rôle en haut à droite */}
        <div className="absolute top-3 right-3">
          {getRoleBadge()}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5">
        {/* Titre */}
        <h3
          onClick={() => navigate(`/projects/${project.id}`)}
          className="text-lg font-semibold text-white mb-2 cursor-pointer hover:text-blue-400 transition-colors line-clamp-1"
        >
          {project.title}
        </h3>

        {/* Fichier scénario */}
        {project.scenario_file && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-1">
            📄 {project.scenario_file}
          </p>
        )}

        {/* Date de création */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Calendar className="w-4 h-4" />
          <span>Créé le {formatDate(project.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-700">
          {/* Bouton Ouvrir */}
          <button
            onClick={() => navigate(`/projects/${project.id}`)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Ouvrir
          </button>

          {/* Bouton Éditer (seulement pour owner et editor) */}
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              title="Modifier le projet"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Bouton Supprimer (seulement pour owner) */}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
              className="p-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
              title="Supprimer le projet"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Message si viewer only */}
          {!canEdit && (
            <div className="flex-1 text-center">
              <span className="text-xs text-slate-500">
                Accès en lecture seule
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}