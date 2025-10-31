import { useState, useEffect } from 'react';
import { Plus, Film, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectModal } from './ProjectModal';
import { ProjectCard } from './ProjectCard';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../api/projects';
import type { Project, CreateProjectData, UpdateProjectData } from '../../types/project.types';
import logo from '../../assets/logo.png';

export function ProjectList() {
  const { signOut } = useAuth();
  
  // États
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12); // 12 projets par page

  useEffect(() => {
    loadProjects();
  }, [currentPage]);

  /**
   * Charge les projets avec pagination
   */
  const loadProjects = async () => {
    setLoading(true);
    try {
      console.log('🔄 Chargement des projets...');
      const data = await projectService.getProjects(currentPage, limit);
      
      setProjects(data.projects);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      
      console.log('✅ Projets chargés:', {
        count: data.projects.length,
        total: data.total,
        page: data.page
      });
    } catch (error) {
      console.error('❌ Erreur lors du chargement des projets:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crée un nouveau projet
   */
  const createProject = async (projectData: CreateProjectData) => {
    try {
      console.log('➕ Création du projet...');
      await projectService.createProject(projectData);
      
      // Recharger la première page après création
      setCurrentPage(1);
      await loadProjects();
      setShowModal(false);
      
      console.log('✅ Projet créé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création du projet:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la création du projet');
    }
  };

  /**
   * Met à jour un projet existant
   */
  const updateProject = async (projectData: UpdateProjectData) => {
    if (!editingProject) return;

    try {
      console.log('✏️ Mise à jour du projet...');
      await projectService.updateProject(editingProject.id, projectData);
      await loadProjects();
      setShowModal(false);
      setEditingProject(null);
      
      console.log('✅ Projet mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la modification du projet:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la modification du projet');
    }
  };

  /**
   * Supprime un projet
   */
  const deleteProject = async (id: string) => {
    const project = projects.find(p => p.id === id);
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${project?.title}" ? Toutes les données associées seront également supprimées.`)) {
      return;
    }

    try {
      console.log('🗑️ Suppression du projet...');
      await projectService.deleteProject(id);
      
      // Si on supprime le dernier projet d'une page, revenir à la page précédente
      if (projects.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadProjects();
      }
      
      console.log('✅ Projet supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du projet:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la suppression du projet');
    }
  };

  /**
   * Ouvre le modal d'édition
   */
  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  /**
   * Ferme le modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  /**
   * Confirme la création/modification
   */
  const handleConfirmModal = (projectData: CreateProjectData) => {
    if (editingProject) {
      updateProject(projectData);
    } else {
      createProject(projectData);
    }
  };

  /**
   * Navigation pagination
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // État de chargement
  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-white text-lg">Chargement des projets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="FilmBoard Logo" className="h-10 w-auto" />
            {total > 0 && (
              <span className="text-slate-400 text-sm ml-4">
                {total} projet{total > 1 ? 's' : ''}
              </span>
            )}
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
          // État vide
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
          <>
            {/* Grille de projets */}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Bouton précédent */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${currentPage === 1
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Numéros de page */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Afficher seulement quelques pages autour de la page actuelle
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`
                            min-w-[40px] px-3 py-2 rounded-lg transition-colors
                            ${page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }
                          `}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="text-slate-500 px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Bouton suivant */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`
                    p-2 rounded-lg transition-colors
                    ${currentPage === totalPages
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Info pagination */}
                <span className="ml-4 text-slate-400 text-sm">
                  Page {currentPage} sur {totalPages}
                </span>
              </div>
            )}

            {/* Indicateur de chargement lors du changement de page */}
            {loading && (
              <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6 shadow-xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <div className="text-white text-sm">Chargement...</div>
                </div>
              </div>
            )}
          </>
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