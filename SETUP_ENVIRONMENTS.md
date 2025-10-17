# 🔧 Configuration des environnements Supabase

## 📦 Structure des fichiers

```
.env                    → DEV local (gitignored)
.env.development        → Template DEV (commité)
.env.production         → Template PROD (commité)
.env.example            → Exemple (commité)
```

## 🎯 Étapes de configuration

### 1️⃣ Créer un projet Supabase pour la PRODUCTION

1. Allez sur https://supabase.com/dashboard
2. Cliquez sur "New Project"
3. Nommez-le : **filmboard-production**
4. Choisissez une région proche de vos utilisateurs
5. Créez un mot de passe fort

### 2️⃣ Récupérer les clés PRODUCTION

1. Dans le projet production → Settings → API
2. Copiez :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon public key** : `eyJ...`

### 3️⃣ Mettre à jour `.env.production`

Éditez le fichier `.env.production` et remplacez :

```bash
VITE_SUPABASE_URL=https://votre-projet-prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...votre_clé_prod...
```

### 4️⃣ Configurer Vercel avec PRODUCTION

Supprimez les anciennes variables dans Vercel :

```bash
# Se connecter à Vercel
vercel

# Supprimer l'ancienne URL (si elle existe)
vercel env rm VITE_SUPABASE_URL production

# Ajouter les nouvelles variables de PRODUCTION
vercel env add VITE_SUPABASE_URL production
# Collez l'URL de production

vercel env add VITE_SUPABASE_ANON_KEY production
# Collez la clé de production
```

### 5️⃣ Migrer la base de données

Pour copier la structure de DEV vers PROD :

**Option A : Via l'interface Supabase**
1. Projet DEV → SQL Editor
2. Ouvrez votre migration : `supabase/migrations/20251011133627_create_filmboard_schema.sql`
3. Copiez tout le SQL
4. Projet PROD → SQL Editor
5. Collez et exécutez

**Option B : Utiliser les migrations Supabase**
```bash
# Initialiser Supabase CLI (si pas déjà fait)
npx supabase init

# Lier au projet PRODUCTION
npx supabase link --project-ref VOTRE_REF_PROD

# Pousser les migrations
npx supabase db push
```

### 6️⃣ Configurer les policies RLS (Row Level Security)

Les policies sont dans vos migrations, mais vérifiez dans :
- Projet PROD → Authentication → Policies

### 7️⃣ Configurer le Storage

Si vous utilisez le storage (pour les PDFs) :

1. Projet PROD → Storage
2. Créez les buckets :
   - `scenarios` (public ou private selon vos besoins)
3. Configurez les policies de storage

### 8️⃣ Configurer l'authentification

1. Projet PROD → Authentication → URL Configuration
2. **Site URL** : `https://votre-app.vercel.app`
3. **Redirect URLs** : `https://votre-app.vercel.app/**`

## 🧪 Tester les environnements

### Test DEV (local)
```bash
npm run dev
# Devrait utiliser .env avec la base DEV
# Vérifiez la console : "🔧 Environment: development"
```

### Test PROD (build local)
```bash
npm run build
npm run preview
# Simule la production localement
```

### Test PROD (Vercel)
```bash
vercel --prod
# Déploie en production avec les variables de prod
```

## 🔍 Vérification

Pour vérifier que tout fonctionne :

1. **En DEV** : Ouvrez la console navigateur
   - Vous devriez voir : "🔧 Environment: development"
   - URL Supabase devrait être celle de DEV

2. **En PROD** : Sur Vercel
   - Pas de logs dans la console
   - URL Supabase devrait être celle de PROD

## 📊 Résumé des environnements

| Environnement | Base Supabase | Fichier | Utilisation |
|---------------|---------------|---------|-------------|
| Development | filmboard-dev | `.env` | `npm run dev` |
| Production | filmboard-production | Variables Vercel | Déploiement Vercel |

## 🚨 Important

- ⚠️ **NE JAMAIS** commiter `.env`
- ⚠️ **NE JAMAIS** partager les clés en public
- ✅ Les fichiers `.env.development` et `.env.production` sont des templates (sans vraies clés)
- ✅ Vite utilise automatiquement `.env` en dev et les variables d'environnement système en prod

## 🔐 Sécurité

1. Les clés `anon` sont publiques (c'est normal)
2. La sécurité vient des RLS policies dans Supabase
3. Ne mettez JAMAIS la `service_role_key` côté client
