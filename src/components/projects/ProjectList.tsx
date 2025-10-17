import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Film, LogOut } from 'lucide-react';
import { ProjectModal } from './ProjectModal';
import { ProjectCard } from './ProjectCard';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

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

export function ProjectList() {
  const { signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors du chargement des projets:', error);
    } else if (data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.id,
      });

    if (error) {
      console.error('Erreur lors de la création du projet:', error);
      alert('Erreur lors de la création du projet');
    } else {
      await loadProjects();
      setShowModal(false);
    }
  };

  const updateProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!editingProject) return;

    const { error } = await supabase
      .from('projects')
      .update(projectData)
      .eq('id', editingProject.id);

    if (error) {
      console.error('Erreur lors de la modification du projet:', error);
      alert('Erreur lors de la modification du projet');
    } else {
      await loadProjects();
      setShowModal(false);
      setEditingProject(null);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Toutes les données associées (séquences, jours de tournage, décors) seront également supprimées.')) {
      return;
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      alert('Erreur lors de la suppression du projet');
    } else {
      await loadProjects();
    }
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleConfirmModal = (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (editingProject) {
      updateProject(projectData);
    } else {
      createProject(projectData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
           {/* logo */}
           <img src={logo} alt="FilmBoard Logo" className="h-10 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau projet
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-400 mb-2">
              Aucun projet pour le moment
            </h2>
            <p className="text-slate-500 mb-6">
              Créez votre premier projet pour commencer
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer un projet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleOpenEditModal}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <ProjectModal
        isOpen={showModal}
        project={editingProject}
        onConfirm={handleConfirmModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
