import { useNavigate } from 'react-router-dom';
import { Calendar, Edit2, Trash2, FileText } from 'lucide-react';

interface Project {
  id: string;
  user_id: string;
  title: string;
  scenario_file: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDelete = () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ? Toutes les données associées (séquences, jours de tournage, décors) seront également supprimées.`)) {
      onDelete(project.id);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors group justify-between">
      
      <div className=" justify-between flex flex-col flex-1 h-full ">
     <div className="flex items-start justify-between mb-4"> 
    
        <h3 className="text-lg font-semibold text-white line-clamp-2">
          {project.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(project)}
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {project.scenario_file && (
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2"> 
          <FileText className="w-4 h-4" />
          <span className="truncate">{project.scenario_file}</span>
        </div>
      )}

      {(project.start_date || project.end_date) && (
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2"> 
          <Calendar className="w-4 h-4" />
          <span>
            {formatDate(project.start_date)} → {formatDate(project.end_date)}
          </span>
        </div>
      )}

      <button
        onClick={() => navigate(`/projects/${project.id}/planning`)}
        className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        Ouvrir le projet
      </button>

        </div>
    </div>
  );
}
