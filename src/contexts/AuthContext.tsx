import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../api/auth';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const initAuth = async () => {
      try {
        // Récupérer l'utilisateur depuis le cache
        const cachedUser = authService.getCachedUser();
        
        if (cachedUser && authService.isAuthenticated()) {
          // Vérifier que le token est toujours valide
          try {
            const currentUser = await authService.getMe();
            setUser(currentUser);
          } catch (error) {
            // Token invalide, déconnecter
            authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('❌ [AUTH] Erreur initialisation:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await authService.register({ email, password, full_name: fullName });
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  };

  const signOut = async () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
