import apiClient from './client';

// 📦 Interfaces pour l'application frontend
export interface Project {
  id: string;
  title: string;
  scenario_file: string | null;
  created_at: string;
  updated_at: string;
  user_role?: 'owner' | 'editor' | 'viewer'; // Rôle de l'utilisateur sur ce projet
}

export interface ProjectWithStats extends Project {
  statistics: {
    total_scenes: number;
    total_shooting_days: number;
    total_personnes: number;
  };
}

export interface CreateProjectData {
  title: string;
  scenario_file?: string | null;
}

export interface UpdateProjectData {
  title?: string;
  scenario_file?: string | null;
}

// 📊 Réponses API standardisées
export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: {
    projects: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: Project;
  };
}

export interface ProjectWithStatsResponse {
  success: boolean;
  message: string;
  data: {
    project: Project;
    statistics: {
      total_scenes: number;
      total_shooting_days: number;
      total_personnes: number;
    };
  };
}

export interface DeleteResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

export interface ShareProjectData {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface ShareResponse {
  success: boolean;
  message: string;
  data: null;
}

/**
 * 🎬 Service de gestion des projets
 * Communique avec l'API backend /api/projects
 */
class ProjectService {
  /**
   * 📋 GET /api/projects - Liste tous les projets de l'utilisateur
   * @param page - Numéro de page (par défaut: 1)
   * @param limit - Nombre d'éléments par page (par défaut: 20)
   * @returns Liste des projets avec pagination
   */
  async getProjects(page = 1, limit = 20): Promise<ProjectsResponse['data']> {
    console.log('📋 Récupération de la liste des projets...', { page, limit });
    
    try {
      const response = await apiClient.get<ProjectsResponse>('/projects', {
        params: { page, limit }
      });

      console.log('✅ Projets récupérés:', {
        count: response.data.data.projects.length,
        total: response.data.data.total,
        page: response.data.data.page
      });

      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des projets:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 📋 GET /api/projects (simplifié) - Retourne seulement le tableau de projets
   * @param page - Numéro de page
   * @param limit - Nombre d'éléments par page
   * @returns Tableau de projets uniquement
   */
  async getProjectsList(page = 1, limit = 20): Promise<Project[]> {
    const data = await this.getProjects(page, limit);
    return data.projects;
  }

  /**
   * 🔍 GET /api/projects/:id - Récupère un projet par son ID avec statistiques
   * @param id - ID du projet
   * @returns Projet avec statistiques
   */
  async getProject(id: string): Promise<ProjectWithStats> {
    console.log(`🔍 Récupération du projet ${id}...`);
    
    try {
      const response = await apiClient.get<ProjectWithStatsResponse>(`/projects/${id}`);
      
      console.log('✅ Projet récupéré:', response.data.data.project.title);
      
      return {
        ...response.data.data.project,
        statistics: response.data.data.statistics
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du projet:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 🔍 GET /api/projects/:id (simplifié) - Récupère seulement les infos du projet
   * @param id - ID du projet
   * @returns Projet sans statistiques
   */
  async getProjectBasic(id: string): Promise<Project> {
    const projectWithStats = await this.getProject(id);
    const { statistics, ...project } = projectWithStats;
    return project;
  }

  /**
   * ➕ POST /api/projects - Crée un nouveau projet
   * @param projectData - Données du projet à créer
   * @returns Projet créé
   */
  async createProject(projectData: CreateProjectData): Promise<Project> {
    console.log('➕ Création d\'un nouveau projet:', projectData.title);
    
    // Validation côté client
    if (!projectData.title || projectData.title.trim() === '') {
      throw new Error('Le titre du projet est requis');
    }

    if (projectData.title.length > 255) {
      throw new Error('Le titre ne peut pas dépasser 255 caractères');
    }

    try {
      const response = await apiClient.post<ProjectResponse>('/projects', projectData);
      
      console.log('✅ Projet créé avec succès:', response.data.data.project.id);
      return response.data.data.project;
    } catch (error) {
      console.error('❌ Erreur lors de la création du projet:', error);
      throw this.handleError(error);
    }
  }

  /**
   * ✏️ PUT /api/projects/:id - Met à jour un projet
   * @param id - ID du projet
   * @param projectData - Données à mettre à jour
   * @returns Projet mis à jour
   */
  async updateProject(id: string, projectData: UpdateProjectData): Promise<Project> {
    console.log(`✏️ Mise à jour du projet ${id}...`, projectData);
    
    // Validation côté client
    if (projectData.title !== undefined) {
      if (!projectData.title || projectData.title.trim() === '') {
        throw new Error('Le titre du projet ne peut pas être vide');
      }
      if (projectData.title.length > 255) {
        throw new Error('Le titre ne peut pas dépasser 255 caractères');
      }
    }

    // Vérifier qu'au moins un champ est fourni
    if (Object.keys(projectData).length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    try {
      const response = await apiClient.put<ProjectResponse>(`/projects/${id}`, projectData);
      
      console.log('✅ Projet mis à jour avec succès');
      return response.data.data.project;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du projet:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 🗑️ DELETE /api/projects/:id - Supprime un projet
   * @param id - ID du projet à supprimer
   */
  async deleteProject(id: string): Promise<void> {
    console.log(`🗑️ Suppression du projet ${id}...`);
    
    try {
      await apiClient.delete<DeleteResponse>(`/projects/${id}`);
      console.log('✅ Projet supprimé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du projet:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 👥 POST /api/projects/:id/share - Partage un projet avec un utilisateur
   * @param id - ID du projet
   * @param shareData - Email et rôle de l'utilisateur
   */
  async shareProject(id: string, shareData: ShareProjectData): Promise<void> {
    console.log(`👥 Partage du projet ${id} avec ${shareData.email}...`);
    
    // Validation côté client
    if (!shareData.email || !shareData.email.includes('@')) {
      throw new Error('Email invalide');
    }

    if (!['owner', 'editor', 'viewer'].includes(shareData.role)) {
      throw new Error('Rôle invalide. Utilisez: owner, editor ou viewer');
    }

    try {
      const response = await apiClient.post<ShareResponse>(`/projects/${id}/share`, shareData);
      console.log('✅ Projet partagé avec succès:', response.data.message);
    } catch (error) {
      console.error('❌ Erreur lors du partage du projet:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 🔄 PUT /api/projects/:id/role - Modifie le rôle d'un utilisateur sur un projet
   * @param id - ID du projet
   * @param userId - ID de l'utilisateur
   * @param role - Nouveau rôle
   */
  async updateUserRole(id: string, userId: string, role: 'owner' | 'editor' | 'viewer'): Promise<void> {
    console.log(`🔄 Modification du rôle sur le projet ${id} pour l'utilisateur ${userId}...`);
    
    if (!['owner', 'editor', 'viewer'].includes(role)) {
      throw new Error('Rôle invalide');
    }

    try {
      await apiClient.put(`/projects/${id}/role`, { userId, role });
      console.log('✅ Rôle mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la modification du rôle:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 👥 GET /api/projects/:id/collaborators - Liste les collaborateurs d'un projet
   * @param id - ID du projet
   * @returns Liste des collaborateurs avec leurs rôles
   */
  async getCollaborators(id: string): Promise<Array<{
    user_id: string;
    email: string;
    display_name: string | null;
    role: 'owner' | 'editor' | 'viewer';
  }>> {
    console.log(`👥 Récupération des collaborateurs du projet ${id}...`);
    
    try {
      const response = await apiClient.get(`/projects/${id}/collaborators`);
      console.log('✅ Collaborateurs récupérés:', response.data.data.collaborators.length);
      return response.data.data.collaborators;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des collaborateurs:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 🚫 DELETE /api/projects/:id/collaborators/:userId - Retire un collaborateur
   * @param projectId - ID du projet
   * @param userId - ID de l'utilisateur à retirer
   */
  async removeCollaborator(projectId: string, userId: string): Promise<void> {
    console.log(`🚫 Retrait du collaborateur ${userId} du projet ${projectId}...`);
    
    try {
      await apiClient.delete(`/projects/${projectId}/collaborators/${userId}`);
      console.log('✅ Collaborateur retiré avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du retrait du collaborateur:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 📊 GET /api/projects/:id/statistics - Récupère uniquement les statistiques
   * @param id - ID du projet
   * @returns Statistiques du projet
   */
  async getProjectStatistics(id: string): Promise<{
    total_scenes: number;
    total_shooting_days: number;
    total_personnes: number;
  }> {
    console.log(`📊 Récupération des statistiques du projet ${id}...`);
    
    try {
      const projectWithStats = await this.getProject(id);
      console.log('✅ Statistiques récupérées');
      return projectWithStats.statistics;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 🔍 Vérifie si l'utilisateur a accès à un projet
   * @param id - ID du projet
   * @returns true si l'utilisateur a accès, false sinon
   */
  async checkAccess(id: string): Promise<boolean> {
    try {
      await this.getProjectBasic(id);
      return true;
    } catch (error: any) {
      if (error.message.includes('403') || error.message.includes('non autorisé')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * 🔍 Récupère le rôle de l'utilisateur sur un projet
   * @param id - ID du projet
   * @returns Rôle de l'utilisateur ('owner', 'editor', 'viewer') ou null
   */
  async getUserRole(id: string): Promise<'owner' | 'editor' | 'viewer' | null> {
    try {
      const project = await this.getProjectBasic(id);
      return project.user_role || null;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du rôle:', error);
      return null;
    }
  }

  /**
   * ⚠️ Gestion des erreurs
   * Transforme les erreurs API en messages clairs pour l'utilisateur
   */
  private handleError(error: any): Error {
    // Erreur de réponse du serveur
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data?.error;
      
      // Messages d'erreur selon le code HTTP
      switch (status) {
        case 400:
          return new Error(errorData?.message || 'Données invalides');
        case 401:
          return new Error('Non authentifié. Veuillez vous reconnecter');
        case 403:
          return new Error(errorData?.message || 'Accès non autorisé à ce projet');
        case 404:
          return new Error('Projet non trouvé');
        case 500:
          return new Error(errorData?.message || 'Erreur serveur. Veuillez réessayer');
        default:
          return new Error(errorData?.message || `Erreur ${status}`);
      }
    }
    
    // Erreur réseau (pas de réponse)
    if (error.request) {
      return new Error('Impossible de contacter le serveur. Vérifiez votre connexion');
    }
    
    // Autre erreur
    return new Error(error.message || 'Une erreur est survenue');
  }
}

// Export singleton
export const projectService = new ProjectService();

// Export par défaut
export default projectService;