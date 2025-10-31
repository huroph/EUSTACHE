import axios, { AxiosInstance, AxiosError } from 'axios';

// URL de base de ton API (à configurer selon ton environnement)

let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = API_BASE_URL.replace(/\/?$/, '/api');
}


// Création de l'instance axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
});

// Intercepteur pour router les appels auth
apiClient.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/auth')) {
    // Route d'authentification : enlever le préfixe /api
    config.baseURL = API_BASE_URL.replace(/\/api$/, '');
  }
  return config;
});

// Intercepteur pour ajouter le token à chaque requête
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
