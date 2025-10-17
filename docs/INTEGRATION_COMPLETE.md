# 🎯 Intégration complète - FilmBoard Auth

## 📋 Checklist d'installation

### 1️⃣ Backend (API Express)

```bash
# Structure du projet API
api-filmboard/
├── .env
├── package.json
├── app.js
├── supabase.js
└── routes/
    └── auth.js
```

**Installation :**
```bash
cd /path/to/api-filmboard
npm install express @supabase/supabase-js cors dotenv bcryptjs jsonwebtoken
npm install --save-dev nodemon
```

**Configuration .env :**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your-super-secret-key
PORT=4000
```

**Démarrage :**
```bash
npm run dev
```

### 2️⃣ Frontend (React)

**Installation :**
```bash
cd /Users/shagane/Documents/PROJECTS/filmBoard
npm install axios
```

**Configuration .env :**
```bash
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Démarrage :**
```bash
npm run dev
```

## 🔄 Flux complet d'une requête authentifiée

### Exemple : Récupérer les projets d'un utilisateur

```tsx
// 1. L'utilisateur se connecte
const { signIn } = useAuth();
await signIn('user@example.com', 'password123');

// 2. Le token est stocké dans localStorage
// access_token: "eyJhbGc..."

// 3. Récupération des projets
import { getAuthenticatedSupabaseClient } from '../lib/supabase';

const supabase = getAuthenticatedSupabaseClient();
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.id);

// 4. Le token est automatiquement ajouté dans les headers
// Authorization: Bearer eyJhbGc...
```

## 🛠️ Modification des composants existants

### ProjectList.tsx - Avant
```tsx
const { data: { user } } = await supabase.auth.getUser();
```

### ProjectList.tsx - Après
```tsx
import { useAuth } from '../../contexts/AuthContext';

function ProjectList() {
  const { user } = useAuth();
  
  // user est déjà disponible via le context
}
```

### Requêtes Supabase - Avant
```tsx
const { data } = await supabase
  .from('projects')
  .select('*');
```

### Requêtes Supabase - Après
```tsx
import { getAuthenticatedSupabaseClient } from '../../lib/supabase';

const supabase = getAuthenticatedSupabaseClient();
const { data } = await supabase
  .from('projects')
  .select('*');
```

## 🔐 Protection des routes

### router.tsx - Ajout d'une route protégée

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Utilisation
<Route path="/projects" element={
  <ProtectedRoute>
    <ProjectList />
  </ProtectedRoute>
} />
```

## 📡 Ajout de nouvelles routes API

### Exemple : Route pour mettre à jour le profil

**Backend (API Express) :**
```javascript
// routes/auth.js
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    res.status(500).json({ message: 'Erreur mise à jour profil' });
  }
});
```

**Frontend (React) :**
```typescript
// src/api/auth.ts
async updateProfile(fullName: string): Promise<User> {
  const response = await apiClient.put<{ user: User }>('/auth/profile', {
    full_name: fullName
  });
  
  localStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data.user;
}
```

**Utilisation dans un composant :**
```tsx
import { authService } from '../api/auth';

async function handleUpdateProfile() {
  try {
    const updatedUser = await authService.updateProfile('New Name');
    console.log('Profil mis à jour:', updatedUser);
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

## 🧩 Intégration avec les composants existants

### 1. Auth.tsx (Composant de connexion)

**Aucune modification nécessaire !** ✅

Le composant utilise déjà `useAuth()` qui pointe maintenant vers ton API.

### 2. ProjectList.tsx

```tsx
// Avant
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  // Charger les projets
}

// Après
const { user } = useAuth();
if (user) {
  const supabase = getAuthenticatedSupabaseClient();
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);
}
```

### 3. ProjectModal.tsx

Même principe que ProjectList.tsx

## 🔍 Debugging

### Console logs utiles

```typescript
// Vérifier l'état d'authentification
console.log('User:', localStorage.getItem('user'));
console.log('Token:', localStorage.getItem('access_token'));

// Vérifier le contexte
import { useAuth } from './contexts/AuthContext';
const { user, loading } = useAuth();
console.log('Auth State:', { user, loading });
```

### Network tab

**Requêtes à surveiller :**
- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `GET /auth/me` - Vérification du profil
- Toutes les requêtes Supabase doivent avoir le header `Authorization`

## 🚀 Déploiement

### API Express

**Options :**
1. **Render.com** (gratuit)
2. **Railway.app** (gratuit)
3. **Heroku** (payant)
4. **VPS** (DigitalOcean, Linode, etc.)

**Variables d'environnement à configurer :**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV=production`

### Frontend (React)

**Vercel :**
```bash
vercel --prod
```

**Variables d'environnement Vercel :**
- `VITE_API_URL` → URL de ton API déployée
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📊 Métriques de succès

### Checklist finale

- [ ] API Express fonctionne en local
- [ ] Frontend React fonctionne en local
- [ ] Inscription crée un utilisateur
- [ ] Connexion renvoie un token
- [ ] Token est stocké dans localStorage
- [ ] Déconnexion vide localStorage
- [ ] Persistance de session après rafraîchissement
- [ ] Requêtes Supabase utilisent le token
- [ ] Gestion des erreurs 401
- [ ] Logs clairs dans la console
- [ ] Documentation complète

### Performance

- **Temps de réponse API** : < 200ms
- **Taille du token JWT** : ~200-300 caractères
- **Nombre de requêtes au chargement** : 2 (getMe + données initiales)

## 🎓 Concepts clés maîtrisés

1. **Architecture REST** : API Express avec routes authentifiées
2. **JWT** : Génération, validation, stockage
3. **React Context** : Gestion d'état global
4. **Axios** : Client HTTP avec intercepteurs
5. **TypeScript** : Types pour sécurité et autocomplétion
6. **localStorage** : Persistance des données client
7. **Supabase** : Utilisation pour les données uniquement

## 🎉 Résultat final

Tu as maintenant :

✅ **Une API d'authentification robuste**
- Routes register, login, me
- Middleware d'authentification
- Gestion des erreurs

✅ **Un frontend React intégré**
- Context d'authentification
- Service centralisé
- Types TypeScript

✅ **Une architecture claire**
- Séparation auth / données
- Code maintenable
- Documentation complète

✅ **Une expérience développeur optimale**
- Logs clairs
- Gestion d'erreurs
- Hot reload

## 💪 Prochaines améliorations possibles

1. **Refresh token** : Renouvellement automatique des tokens
2. **OAuth** : Connexion Google, GitHub, etc.
3. **2FA** : Authentification à deux facteurs
4. **Rate limiting** : Limitation des tentatives de connexion
5. **Email verification** : Vérification d'email obligatoire
6. **Password reset** : Réinitialisation de mot de passe
7. **Session management** : Gestion des sessions actives
8. **Audit logs** : Historique des connexions

Besoin d'aide pour implémenter l'une de ces fonctionnalités ? Demande-moi ! 🚀
