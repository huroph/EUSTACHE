import apiClient from './client';
import { User, AuthResponse, RegisterData, LoginData, AuthError } from '../types/auth';

/**
 * Service d'authentification
 * Gère toutes les interactions avec l'API d'auth
 */
class AuthService {
  private readonly AUTH_BASE = '/auth';

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('📝 [AUTH] Tentative d\'inscription:', data.email);
      
      const response = await apiClient.post<AuthResponse>(
        `${this.AUTH_BASE}/register`,
        data
      );

      // Sauvegarder le token et l'utilisateur
      if (response.data.access_token) {
        this.saveAuth(response.data);
      }

      console.log('✅ [AUTH] Inscription réussie:', response.data.user.email);
      return response.data;
    } catch (error: any) {
      console.error('❌ [AUTH] Erreur inscription:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log('🔐 [AUTH] Tentative de connexion:', data.email);
      
      const response = await apiClient.post<AuthResponse>(
        `${this.AUTH_BASE}/login`,
        data
      );

      // Sauvegarder le token et l'utilisateur
      if (response.data.access_token) {
        this.saveAuth(response.data);
      }

      console.log('✅ [AUTH] Connexion réussie:', response.data.user.email);
      return response.data;
    } catch (error: any) {
      console.error('❌ [AUTH] Erreur connexion:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getMe(): Promise<User> {
    try {
      const response = await apiClient.get<{ user: User }>(`${this.AUTH_BASE}/me`);
      
      // Mettre à jour les données de l'utilisateur en cache
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data.user;
    } catch (error: any) {
      console.error('❌ [AUTH] Erreur récupération profil:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Déconnexion
   */
  logout(): void {
    console.log('👋 [AUTH] Déconnexion');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Récupérer l'utilisateur depuis le cache
   */
  getCachedUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Récupérer le token d'accès
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Sauvegarder les données d'authentification
   */
  private saveAuth(data: AuthResponse): void {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
  }

  /**
   * Gérer les erreurs de l'API
   */
  private handleError(error: any): AuthError {
    if (error.response) {
      // Erreur de réponse du serveur
      return {
        message: error.response.data?.message || 'Une erreur est survenue',
        status: error.response.status,
      };
    } else if (error.request) {
      // Pas de réponse du serveur
      return {
        message: 'Impossible de contacter le serveur',
      };
    } else {
      // Erreur lors de la configuration de la requête
      return {
        message: error.message || 'Une erreur est survenue',
      };
    }
  }
}

// Export d'une instance unique (singleton)
export const authService = new AuthService();
