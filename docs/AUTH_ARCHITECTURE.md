# 🔐 Architecture d'Authentification FilmBoard

## 📁 Structure

```
src/
├── api/
│   ├── client.ts          # Client HTTP axios configuré avec intercepteurs
│   └── auth.ts            # Service d'authentification (register, login, getMe)
├── contexts/
│   └── AuthContext.tsx    # Context React pour gérer l'état d'authentification
├── lib/
│   └── supabase.ts        # Client Supabase pour les données (pas l'auth)
├── types/
│   └── auth.ts            # Types TypeScript pour l'authentification
└── components/
    └── auth/
        └── Auth.tsx       # Composant d'authentification (login/register)
```

## 🔄 Flux d'authentification

### 1️⃣ Inscription (Register)

```
User Input → AuthContext.signUp() 
           → authService.register()
           → POST /auth/register (API Express)
           → Réponse: { user, access_token }
           → Sauvegarde: localStorage + Context
```

### 2️⃣ Connexion (Login)

```
User Input → AuthContext.signIn()
           → authService.login()
           → POST /auth/login (API Express)
           → Réponse: { user, access_token }
           → Sauvegarde: localStorage + Context
```

### 3️⃣ Vérification de session

```
App Mount → AuthContext useEffect()
          → authService.getCachedUser()
          → authService.getMe() (GET /auth/me)
          → Mise à jour Context
```

### 4️⃣ Déconnexion (Logout)

```
User Action → AuthContext.signOut()
            → authService.logout()
            → Nettoyage localStorage
            → Mise à jour Context (user = null)
```

## 🔑 Gestion des tokens

### Stockage
- **access_token** : Stocké dans `localStorage`
- **user** : Stocké dans `localStorage` (cache)
- **refresh_token** : Optionnel, stocké dans `localStorage`

### Intercepteurs axios
- **Request** : Ajoute automatiquement le token dans `Authorization: Bearer <token>`
- **Response** : Gère les erreurs 401 (token invalide) en déconnectant l'utilisateur

## 📡 API Endpoints

### POST /auth/register
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "editor",
    "created_at": "2025-10-17T10:00:00Z"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "optional"
}
```

### POST /auth/login
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "editor"
  },
  "access_token": "eyJhbGc..."
}
```

### GET /auth/me
**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "editor"
  }
}
```

## 🛡️ Sécurité

### Client (React)
- ✅ Tokens stockés dans `localStorage` (accessible uniquement côté client)
- ✅ Intercepteurs axios pour gérer les erreurs 401
- ✅ Validation automatique du token au chargement de l'app
- ✅ Déconnexion automatique si token invalide

### API (Express)
- ✅ Mots de passe hashés avec bcrypt
- ✅ Tokens JWT signés avec secret
- ✅ Middleware d'authentification pour les routes protégées
- ✅ CORS configuré

## 🔧 Configuration

### Variables d'environnement (.env)

```bash
# API d'authentification
VITE_API_URL=http://localhost:4000

# Supabase (pour les données)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 📝 Utilisation dans les composants

### Hook useAuth

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading, signIn, signUp, signOut } = useAuth();

  if (loading) return <div>Chargement...</div>;

  if (!user) {
    return <div>Non connecté</div>;
  }

  return (
    <div>
      <p>Bienvenue {user.full_name || user.email}</p>
      <button onClick={signOut}>Déconnexion</button>
    </div>
  );
}
```

### Requêtes authentifiées avec axios

```tsx
import apiClient from '../api/client';

async function fetchData() {
  // Le token est automatiquement ajouté par l'intercepteur
  const response = await apiClient.get('/some-endpoint');
  return response.data;
}
```

### Requêtes Supabase authentifiées

```tsx
import { getAuthenticatedSupabaseClient } from '../lib/supabase';

async function fetchProjects() {
  const supabase = getAuthenticatedSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

## 🚀 Migration depuis Supabase Auth

### Avant (Supabase Auth)
```tsx
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Après (API personnalisée)
```tsx
const { user, signIn } = useAuth();
await signIn(email, password);
```

## 🐛 Debugging

### Logs dans la console
- 📝 `[AUTH]` : Actions d'authentification
- ✅ Succès avec émoji vert
- ❌ Erreurs avec émoji rouge
- ⚠️ Avertissements avec émoji orange

### Vérifier le token
```javascript
// Dans la console du navigateur
console.log(localStorage.getItem('access_token'));
console.log(JSON.parse(localStorage.getItem('user')));
```

## 📦 Dépendances

```json
{
  "axios": "^1.6.0",
  "@supabase/supabase-js": "^2.x",
  "react": "^18.x"
}
```

## ✨ Avantages de cette architecture

1. **Séparation des préoccupations**
   - Authentification via API Express
   - Données via Supabase
   - Context React pour l'état global

2. **Code simple et maintenable**
   - Service centralisé (`authService`)
   - Types TypeScript pour la sécurité
   - Intercepteurs pour la gestion automatique des tokens

3. **Expérience développeur**
   - Logs clairs dans la console
   - Gestion d'erreurs robuste
   - Hook React simple (`useAuth`)

4. **Sécurité**
   - Tokens JWT
   - Gestion automatique des erreurs 401
   - Validation du token au chargement
