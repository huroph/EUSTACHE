# 🌿 Stratégie des environnements Supabase - FilmBoard

## 🎯 Approche recommandée : 2 projets séparés

### Pourquoi 2 projets ?

✅ **Avantages :**
- Isolation totale (pas de risque de toucher la prod en dev)
- Configuration simple
- Pas besoin du CLI Supabase
- Gratuit (2 projets dans le plan gratuit)
- Chaque projet a ses propres utilisateurs/données

❌ **Inconvénients :**
- Faut maintenir 2 bases
- Migrations à faire 2 fois

### Structure recommandée

```
Projet 1: filmboard-dev
  └─ Pour développement local
  └─ Données de test
  └─ Vous pouvez casser sans risque

Projet 2: filmboard-production
  └─ Pour Vercel (production)
  └─ Vraies données utilisateurs
  └─ Sécurisé et stable
```

## 🔧 Configuration complète

### Étape 1 : Projet DEV (déjà fait)

Votre projet actuel : `https://buaxldexcblozvunpelp.supabase.co`
- ✅ Déjà configuré
- ✅ Utilisé pour `npm run dev`

### Étape 2 : Créer projet PROD

1. **Créer le projet**
   ```
   👉 https://supabase.com/dashboard
   - New Project
   - Nom: filmboard-production
   - Région: Same as dev (pour cohérence)
   - Mot de passe: [NOTER QUELQUE PART SÉCURISÉ]
   ```

2. **Récupérer les credentials**
   ```
   Settings > API
   - Project URL: https://xxx.supabase.co
   - anon public key: eyJ...
   ```

3. **Configurer le projet PROD**

   a) **Copier la structure de base**
   ```
   - Ouvrir SQL Editor dans projet PROD
   - Copier tout le contenu de:
     supabase/migrations/20251011133627_create_filmboard_schema.sql
   - Exécuter dans le projet PROD
   ```

   b) **Configurer l'authentification**
   ```
   Authentication > Providers
   - Activer Email
   - Site URL: https://film-board-xxx.vercel.app
   - Redirect URLs: https://film-board-xxx.vercel.app/**
   ```

   c) **Configurer le Storage** (si vous l'utilisez)
   ```
   Storage > Create bucket
   - Nom: scenarios
   - Public: selon vos besoins
   - Configurer les policies
   ```

### Étape 3 : Mise à jour du code

Les fichiers sont déjà créés :
- `.env` → DEV (local)
- `.env.development` → Template DEV
- `.env.production` → Template PROD (à remplir)

**Action :**
Éditez `.env.production` avec les credentials du projet PROD :

```bash
VITE_SUPABASE_URL=https://votre-projet-prod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...clé_prod...
```

### Étape 4 : Configuration Vercel

```bash
# Supprimer les anciennes variables (si elles existent)
vercel env rm VITE_SUPABASE_URL production
vercel env rm VITE_SUPABASE_ANON_KEY production

# Ajouter les nouvelles (PROD)
vercel env add VITE_SUPABASE_URL production
# Coller l'URL du projet PROD

vercel env add VITE_SUPABASE_ANON_KEY production
# Coller la clé du projet PROD
```

### Étape 5 : Déployer

```bash
npm run deploy
```

## 🔄 Workflow quotidien

### En développement local
```bash
npm run dev
```
→ Utilise `.env` → Projet DEV Supabase
→ Vous pouvez tester, créer, supprimer sans risque

### En production (Vercel)
```bash
npm run deploy
```
→ Utilise variables Vercel → Projet PROD Supabase
→ Données réelles des utilisateurs

## 📊 Synchronisation DEV ↔ PROD

### Quand vous modifiez la structure :

1. **Modifier DEV d'abord**
   - Testez les changements en local
   - Créez une migration SQL

2. **Créer un fichier de migration**
   ```sql
   -- supabase/migrations/YYYYMMDD_description.sql
   
   -- Vos changements SQL ici
   ALTER TABLE sequences ADD COLUMN new_field TEXT;
   ```

3. **Appliquer à PROD**
   - Ouvrez SQL Editor dans projet PROD
   - Exécutez le fichier de migration

### Alternative : Utiliser Supabase CLI (optionnel)

Si vous voulez automatiser :

```bash
# Installer Supabase CLI
npm install -g supabase

# Lier au projet PROD
supabase link --project-ref VOTRE_REF_PROD

# Pousser les migrations
supabase db push
```

## 🌿 Alternative : Branching Supabase (Avancé)

Si vous voulez utiliser une seule base avec branches :

### Prérequis
- Supabase CLI installé
- Plan Pro Supabase (les branches sont dans le plan payant)

### Configuration
```bash
# Initialiser Supabase
supabase init

# Lier au projet
supabase link

# Créer une branche dev
supabase branches create dev

# Créer une branche prod (ou utiliser main)
supabase branches create production
```

### Utilisation
```bash
# Développer sur la branche dev
supabase db branch dev

# Déployer sur prod
supabase db push --branch production
```

⚠️ **Attention :** Cette approche nécessite :
- Plan Supabase Pro (~25$/mois)
- Configuration CLI plus complexe
- Pas recommandé pour débuter

## 💡 Recommandation finale

Pour votre projet actuel, **restez avec 2 projets séparés** :

1. ✅ Plus simple
2. ✅ Gratuit
3. ✅ Isolation totale
4. ✅ Parfait pour solo/petite équipe

Vous pourrez toujours migrer vers le branching plus tard si besoin !

## 📝 Checklist de configuration

- [ ] Projet DEV Supabase existe et fonctionne
- [ ] Créer projet PROD Supabase
- [ ] Copier la structure SQL vers PROD
- [ ] Récupérer credentials PROD
- [ ] Mettre à jour `.env.production`
- [ ] Configurer variables Vercel avec credentials PROD
- [ ] Configurer Auth URLs dans Supabase PROD
- [ ] Déployer sur Vercel
- [ ] Tester en production
- [ ] 🎉 C'est en ligne !
