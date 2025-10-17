# 🧪 Guide de test de l'authentification

## Prérequis

1. **API Express lancée** sur `http://localhost:4000`
2. **Application React lancée** sur `http://localhost:5173`

## 📋 Tests à effectuer

### 1️⃣ Test d'inscription

1. Ouvrir l'application React
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire :
   - Email : `test@example.com`
   - Mot de passe : `password123`
   - Nom complet : `Test User`
4. Cliquer sur "S'inscrire"

**Résultat attendu :**
- ✅ Message de succès dans la console : `✅ [AUTH] Inscription réussie: test@example.com`
- ✅ Redirection vers la page des projets
- ✅ Token stocké dans localStorage

**Vérification :**
```javascript
// Dans la console du navigateur
console.log(localStorage.getItem('access_token'));
console.log(localStorage.getItem('user'));
```

### 2️⃣ Test de connexion

1. Se déconnecter (si connecté)
2. Cliquer sur "Se connecter"
3. Remplir le formulaire :
   - Email : `test@example.com`
   - Mot de passe : `password123`
4. Cliquer sur "Se connecter"

**Résultat attendu :**
- ✅ Message de succès : `✅ [AUTH] Connexion réussie: test@example.com`
- ✅ Redirection vers la page des projets
- ✅ Token stocké dans localStorage

### 3️⃣ Test de persistance de session

1. Se connecter
2. Rafraîchir la page (F5)

**Résultat attendu :**
- ✅ L'utilisateur reste connecté
- ✅ Pas de redirection vers la page de connexion
- ✅ Message dans la console : Vérification du token avec `/auth/me`

### 4️⃣ Test de déconnexion

1. Se connecter
2. Cliquer sur le bouton de déconnexion

**Résultat attendu :**
- ✅ Message : `👋 [AUTH] Déconnexion`
- ✅ Redirection vers la page de connexion
- ✅ localStorage vidé

**Vérification :**
```javascript
// Dans la console du navigateur
console.log(localStorage.getItem('access_token')); // null
console.log(localStorage.getItem('user')); // null
```

### 5️⃣ Test de token invalide

1. Se connecter
2. Modifier manuellement le token dans localStorage :
```javascript
localStorage.setItem('access_token', 'invalid_token_123');
```
3. Rafraîchir la page

**Résultat attendu :**
- ✅ Déconnexion automatique
- ✅ Redirection vers la page de connexion
- ✅ localStorage vidé

### 6️⃣ Test d'erreur de connexion

1. Essayer de se connecter avec un mauvais mot de passe
2. Email : `test@example.com`
3. Mot de passe : `wrongpassword`

**Résultat attendu :**
- ✅ Message d'erreur affiché
- ✅ Pas de redirection
- ✅ Aucun token stocké

## 🔍 Vérifications dans les outils de développement

### Network (Réseau)

**Inscription :**
- Request : `POST http://localhost:4000/auth/register`
- Body : `{ email, password, full_name }`
- Response : `{ user, access_token }`

**Connexion :**
- Request : `POST http://localhost:4000/auth/login`
- Body : `{ email, password }`
- Response : `{ user, access_token }`

**Vérification :**
- Request : `GET http://localhost:4000/auth/me`
- Headers : `Authorization: Bearer <token>`
- Response : `{ user }`

### Application (localStorage)

Ouvrir **DevTools > Application > Local Storage > http://localhost:5173**

Vérifier la présence de :
- `access_token` : JWT token
- `user` : Objet JSON avec les données utilisateur

### Console

Logs attendus lors de la connexion :
```
🔐 [AUTH] Tentative de connexion: test@example.com
✅ [AUTH] Connexion réussie: test@example.com
```

Logs attendus lors de l'initialisation :
```
🔧 Environment: development
🔗 Supabase URL: ✅ Configured
🔑 Supabase Key: ✅ Configured
```

## 🐛 Résolution de problèmes

### Erreur : "Impossible de contacter le serveur"

**Cause :** API Express non lancée

**Solution :**
```bash
cd /path/to/api
node app.js
```

### Erreur : "CORS policy"

**Cause :** CORS non configuré sur l'API

**Solution :** Vérifier que CORS est activé dans `app.js` :
```javascript
const cors = require('cors');
app.use(cors());
```

### Erreur : "Token invalide"

**Cause :** Token expiré ou modifié

**Solution :** Se reconnecter pour obtenir un nouveau token

### Erreur : "User not found"

**Cause :** Utilisateur non créé dans la base de données

**Solution :** Vérifier que l'inscription a bien créé l'utilisateur dans Supabase

## 📊 Checklist de validation

- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Token stocké dans localStorage
- [ ] Utilisateur stocké dans localStorage
- [ ] Persistance de session après rafraîchissement
- [ ] Déconnexion vide localStorage
- [ ] Gestion des erreurs de connexion
- [ ] Déconnexion automatique si token invalide
- [ ] Logs clairs dans la console
- [ ] Requêtes réseau visibles dans DevTools

## 🎯 Prochaines étapes

1. ✅ Tests manuels validés
2. 🔄 Intégration dans les autres composants (ProjectList, etc.)
3. 🔄 Mise à jour des requêtes Supabase pour utiliser le token
4. 🔄 Tests end-to-end automatisés (optionnel)
