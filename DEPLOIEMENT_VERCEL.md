# 🚀 Déploiement sur Vercel - FilmBoard

## Prérequis

- Compte Vercel (https://vercel.com)
- Compte Supabase avec votre projet configuré
- Git initialisé et repository GitHub/GitLab/Bitbucket (optionnel mais recommandé)

## 📋 Étapes de déploiement

### Option 1 : Déploiement via GitHub (Recommandé)

1. **Pusher votre code sur GitHub**
   ```bash
   git add .
   git commit -m "Prêt pour le déploiement"
   git push origin main
   ```

2. **Connecter à Vercel**
   - Allez sur https://vercel.com/dashboard
   - Cliquez sur "Add New Project"
   - Importez votre repository GitHub
   - Vercel détectera automatiquement que c'est un projet Vite

3. **Configurer les variables d'environnement**
   
   Dans les paramètres du projet Vercel, ajoutez ces variables :
   
   ```
   VITE_SUPABASE_URL=votre_url_supabase
   VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   ```

4. **Déployer**
   - Cliquez sur "Deploy"
   - Vercel va automatiquement :
     - Installer les dépendances (`npm install`)
     - Builder le projet (`npm run build`)
     - Déployer le résultat

### Option 2 : Déploiement via CLI Vercel

1. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Déployer depuis le terminal**
   ```bash
   cd /Users/shagane/Documents/PROJECTS/filmBoard
   vercel
   ```

4. **Suivre les instructions**
   - Confirmer le projet
   - Configurer les paramètres (Framework: Vite)
   - Le CLI va vous demander si c'est correct

5. **Ajouter les variables d'environnement**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
   
   Ou via le dashboard : https://vercel.com/[votre-username]/[projet]/settings/environment-variables

6. **Redéployer avec les variables**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration automatique

Le projet inclut déjà :
- ✅ `vercel.json` - Configuration Vercel
- ✅ `.vercelignore` - Fichiers à ignorer
- ✅ Scripts de build dans `package.json`
- ✅ Rewrites pour le routing React Router

## 📝 Variables d'environnement requises

| Variable | Description | Où la trouver |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | Dashboard Supabase > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Clé publique Supabase | Dashboard Supabase > Settings > API |

## 🌐 Après le déploiement

1. **Vérifier le site**
   - Vercel vous donnera une URL (ex: `filmboard.vercel.app`)
   - Testez la connexion et toutes les fonctionnalités

2. **Configurer un domaine personnalisé** (optionnel)
   - Dans Vercel Dashboard > Domains
   - Ajoutez votre domaine
   - Suivez les instructions DNS

3. **Mettre à jour Supabase**
   - Ajoutez l'URL Vercel dans les "Site URL" de Supabase
   - Dashboard Supabase > Authentication > URL Configuration
   - Ajoutez `https://votre-app.vercel.app` dans "Site URL"

## 🔄 Déploiements automatiques

Si vous utilisez GitHub :
- Chaque push sur `main` déclenchera un déploiement automatique
- Les pull requests créeront des preview deployments
- Tout est automatique ! 🎉

## ⚡ Build local pour tester

Avant de déployer, testez localement :

```bash
npm run build
npm run preview
```

Cela simule l'environnement de production.

## 🐛 Troubleshooting

### Erreur : "Module not found"
- Vérifiez que toutes les dépendances sont dans `package.json`
- Lancez `npm install` localement

### Erreur : "Environment variables not defined"
- Vérifiez que les variables sont bien ajoutées dans Vercel
- Elles doivent commencer par `VITE_` pour être accessibles côté client

### Erreur 404 sur les routes
- Le `vercel.json` avec rewrites devrait régler ça
- Si ça persiste, vérifiez la configuration du router

### Build prend trop de temps
- Vérifiez qu'il n'y a pas d'erreurs TypeScript
- Lancez `npm run typecheck` localement

## 📊 Monitoring

Vercel offre :
- 📈 Analytics automatiques
- 🚨 Alertes en cas d'erreur
- 📝 Logs en temps réel
- ⚡ Web Vitals

Consultez tout ça dans le dashboard Vercel !
