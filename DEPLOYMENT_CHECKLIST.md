# 📋 Checklist de Déploiement - FilmBoard

## ✅ Code - PRÊT (Rien à relancer)

- ✅ Application frontend fonctionnelle
- ✅ Serveur Vite en cours d'exécution
- ✅ Aucune erreur de compilation
- ✅ Hot Module Replacement (HMR) actif
- ✅ Tous les composants chargés correctement

**Statut** : 🟢 **L'application tourne correctement, rien à relancer côté code**

---

## ⚠️ Base de données - ACTION REQUISE

### 🔴 Étape 1 : Exécuter les migrations SQL

Vous devez exécuter **2 fichiers SQL** dans Supabase :

#### Migration 1 : Table Projects
📁 **Fichier** : `supabase/migrations/20251011140000_create_projects_table.sql`

**Ce qu'elle fait** :
- Crée la table `projects` (titre, scénario, dates)
- Ajoute `project_id` à `sequences`, `shooting_days`, `decors`
- Configure les RLS policies pour isoler les données par utilisateur
- Crée les index pour les performances

**Comment l'exécuter** :
1. Ouvrir [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **SQL Editor** (icône 📝 dans la sidebar)
4. Cliquer sur **New Query**
5. Copier-coller tout le contenu du fichier
6. Cliquer sur **Run** (ou Ctrl/Cmd + Enter)
7. ✅ Vérifier qu'il n'y a pas d'erreur

#### Migration 2 : Storage Bucket (SÉCURISÉ)
📁 **Fichier** : `supabase/migrations/20251011141000_create_storage_bucket.sql`

**Ce qu'elle fait** :
- Crée le bucket `scenarios` en mode **PRIVÉ** 🔒
- Configure les policies RLS pour le Storage
- Permet à chaque user d'accéder **UNIQUEMENT** à ses propres fichiers
- Bloque tout accès public

**Comment l'exécuter** :
1. Dans le **SQL Editor** de Supabase
2. Cliquer sur **New Query**
3. Copier-coller tout le contenu du fichier
4. Cliquer sur **Run**
5. ✅ Vérifier qu'il n'y a pas d'erreur

### 🔍 Vérification post-migration

Après avoir exécuté les 2 migrations, vérifiez :

```sql
-- Vérifier que la table projects existe
SELECT * FROM projects LIMIT 1;

-- Vérifier que project_id a été ajouté
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'sequences' 
AND column_name = 'project_id';

-- Vérifier que le bucket existe
SELECT * FROM storage.buckets WHERE id = 'scenarios';

-- Vérifier que le bucket est PRIVÉ
SELECT id, name, public FROM storage.buckets WHERE id = 'scenarios';
-- Résultat attendu: public = false
```

---

## 🧪 Tests - À FAIRE APRÈS LES MIGRATIONS

Une fois les migrations exécutées, testez le workflow complet :

### Test 1 : Création de projet sans PDF
1. Connectez-vous à l'application
2. Cliquez sur "Nouveau projet"
3. Remplissez : Titre + Dates
4. Cliquez sur "Créer"
5. ✅ Vérifiez que le projet apparaît dans la liste

### Test 2 : Upload de PDF sécurisé
1. Créez un nouveau projet
2. Cliquez sur "Importer un PDF"
3. Sélectionnez un fichier PDF (< 10MB)
4. ✅ Vérifiez le message "Fichier uploadé"
5. Cliquez sur "Créer"
6. ✅ Vérifiez que le projet est créé

### Test 3 : Affichage du PDF dans le Dépouillement
1. Ouvrez un projet avec PDF
2. Cliquez sur "Dépouillement" (dans le dashboard)
3. ✅ Vérifiez que le PDF s'affiche à gauche
4. ✅ Testez la navigation (page suivante/précédente)
5. ✅ Testez le zoom (+/-)

### Test 4 : Sécurité du PDF
1. Ouvrez la console navigateur (F12)
2. Allez dans l'onglet "Network"
3. Rechargez le PDF
4. ✅ Vérifiez que l'URL contient `?token=...` (URL signée)
5. Copiez l'URL complète du PDF
6. Ouvrez un navigateur privé (mode incognito)
7. Collez l'URL
8. ✅ L'accès devrait être **REFUSÉ** (401 Unauthorized)
   - Cela prouve que le PDF est bien sécurisé

### Test 5 : Création de séquence depuis la Toolbox
1. Dans le Dépouillement, cliquez sur "+" dans la Toolbox (centre)
2. Sélectionnez un jour de tournage
3. Cliquez sur "Créer"
4. ✅ Vérifiez que la séquence apparaît dans la liste
5. Cliquez sur la séquence
6. ✅ Vérifiez que le formulaire s'affiche à droite

### Test 6 : Layout 3 colonnes
1. Dans le Dépouillement avec un PDF
2. ✅ Vérifiez que le layout est correct :
   - 30% : PDF à gauche
   - 20% : Toolbox au centre
   - 50% : Formulaire à droite
3. ✅ Testez le scroll dans chaque colonne

---

## 📊 Checklist Complète

### Migrations (À FAIRE MAINTENANT)
- [ ] Exécuter `20251011140000_create_projects_table.sql`
- [ ] Exécuter `20251011141000_create_storage_bucket.sql`
- [ ] Vérifier que les tables existent
- [ ] Vérifier que le bucket est PRIVÉ

### Tests Fonctionnels (APRÈS MIGRATIONS)
- [ ] Test 1 : Créer un projet sans PDF
- [ ] Test 2 : Uploader un PDF
- [ ] Test 3 : Afficher le PDF dans Dépouillement
- [ ] Test 4 : Vérifier la sécurité du PDF
- [ ] Test 5 : Créer une séquence depuis Toolbox
- [ ] Test 6 : Vérifier le layout 3 colonnes

### Sécurité (VÉRIFICATION)
- [ ] URLs signées générées (contiennent `?token=...`)
- [ ] Accès refusé en mode incognito
- [ ] Chaque user ne voit que ses projets
- [ ] Upload limité à 10MB
- [ ] Format PDF uniquement accepté

---

## 🚀 Prochaines Étapes

Après avoir tout testé :

1. **Migrer les anciennes données** (si vous en aviez)
   ```sql
   -- Créer un projet "Migration" 
   INSERT INTO projects (user_id, title) 
   VALUES ('YOUR_USER_ID', 'Données migrées')
   RETURNING id;
   
   -- Associer les anciennes données
   UPDATE sequences SET project_id = 'PROJECT_ID' WHERE project_id IS NULL;
   UPDATE shooting_days SET project_id = 'PROJECT_ID' WHERE project_id IS NULL;
   UPDATE decors SET project_id = 'PROJECT_ID' WHERE project_id IS NULL;
   ```

2. **Optimisations possibles**
   - Ajouter un loader pendant le chargement du PDF
   - Régénérer l'URL signée toutes les 50 minutes
   - Ajouter un bouton "Télécharger le PDF"
   - Implémenter le watermarking

3. **Features additionnelles**
   - Partage de projet entre utilisateurs
   - Export/Import de projet complet
   - Statistiques par projet

---

## 🆘 En cas de problème

### Erreur : "Table projects does not exist"
➡️ Vous n'avez pas exécuté la migration 1

### Erreur : "Bucket scenarios does not exist"
➡️ Vous n'avez pas exécuté la migration 2

### Erreur : "Permission denied for storage object"
➡️ Le bucket est peut-être encore en mode public
➡️ Vérifiez : `SELECT public FROM storage.buckets WHERE id = 'scenarios'`
➡️ Devrait être `false`

### Le PDF ne s'affiche pas
➡️ Ouvrez la console (F12) et vérifiez les erreurs
➡️ Vérifiez que l'URL signée est générée
➡️ Vérifiez que le chemin du fichier est correct dans la BDD

### L'upload de PDF échoue
➡️ Vérifiez la taille du fichier (< 10MB)
➡️ Vérifiez le format (PDF uniquement)
➡️ Vérifiez les policies du bucket Storage

---

## 📞 Support

- 📄 Documentation sécurité : `SECURITY.md`
- 🏗️ Documentation architecture : `ARCHITECTURE.md`
- 📖 README principal : `README.md`

---

**Statut actuel** : 🟡 **Migrations en attente → AUCUN RELANCEMENT NÉCESSAIRE, juste exécuter les SQL**
