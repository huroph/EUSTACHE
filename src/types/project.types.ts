/**
 * 🎬 Types pour la gestion des projets
 */

// 📦 Rôles utilisateur sur un projet
export type ProjectRole = 'owner' | 'editor' | 'viewer';

// 📁 Projet de base
export interface Project {
  id: string;
  title: string;
  scenario_file: string | null;
  created_at: string;
  updated_at: string;
  user_role?: ProjectRole;
}

// 📊 Projet avec statistiques
export interface ProjectWithStats extends Project {
  statistics: ProjectStatistics;
}

// 📊 Statistiques d'un projet
export interface ProjectStatistics {
  total_scenes: number;
  total_shooting_days: number;
  total_personnes: number;
}

// ➕ Données pour créer un projet
export interface CreateProjectData {
  title: string;
  scenario_file?: string | null;
}

// ✏️ Données pour mettre à jour un projet
export interface UpdateProjectData {
  title?: string;
  scenario_file?: string | null;
}

// 👥 Collaborateur sur un projet
export interface ProjectCollaborator {
  user_id: string;
  email: string;
  display_name: string | null;
  role: ProjectRole;
  added_at?: string;
}

// 👥 Données pour partager un projet
export interface ShareProjectData {
  email: string;
  role: ProjectRole;
}

// 🔄 Données pour modifier le rôle d'un utilisateur
export interface UpdateRoleData {
  userId: string;
  role: ProjectRole;
}

// 📄 Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 🔍 Réponse paginée de projets
export interface PaginatedProjects {
  projects: Project[];
  pagination: PaginationMeta;
}

// ✅ Réponse API standard
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ❌ Erreur API standard
export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

// 📋 Types de réponses spécifiques
export type ProjectsResponse = ApiResponse<{
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}>;

export type ProjectResponse = ApiResponse<{
  project: Project;
}>;

export type ProjectWithStatsResponse = ApiResponse<{
  project: Project;
  statistics: ProjectStatistics;
}>;

export type CollaboratorsResponse = ApiResponse<{
  collaborators: ProjectCollaborator[];
}>;

export type DeleteResponse = ApiResponse<{
  message: string;
}>;

export type ShareResponse = ApiResponse<null>;