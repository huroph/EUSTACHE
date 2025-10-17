import { useEffect, useState } from 'react';
import { Outlet, useParams, useNavigate, NavLink } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import logo from '../../assets/logo.png';

interface Project {
  id: string;
  title: string;
  scenario_file: string | null;
}

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (data) {
      setProject(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Projet non trouvé</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header avec navigation */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="px-6 py-4 flex items-center">
          {/* Bouton retour à gauche */}
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Retour aux projets"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
           <h1 className="text-xl font-bold text-white">{project.title}</h1>

          {/* Logo au centre */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img src={logo} alt="FilmBoard Logo" className="h-10 w-auto" />
          </div>

          {/* Titre du projet à droite */}
         
        </div>

        {/* Navigation tabs */}
        <nav className="px-6 flex gap-2">
          <NavLink
            to={`/projects/${projectId}/planning`}
            className={({ isActive }) =>
              `px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300 border-transparent'
              }`
            }
          >
            <Calendar className="w-4 h-4" />
            Planning
          </NavLink>
          <NavLink
            to={`/projects/${projectId}/depouillement`}
            className={({ isActive }) =>
              `px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300 border-transparent'
              }`
            }
          >
            <FileText className="w-4 h-4" />
            Dépouillement
          </NavLink>
        </nav>
      </header>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
