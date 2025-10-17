# 🎬 Guide de Migration Propre - FilmBoard

## 🎯 Objectif

Repartir de zéro avec une base de données propre, complète et cohérente avec votre code.

## ⚠️ IMPORTANT : Ceci supprime TOUTES les données !

Cette migration va :
1. ❌ Supprimer toutes les tables existantes
2. ❌ Supprimer toutes les données
3. ✅ Recréer tout proprement depuis zéro
4. ✅ Avec la bonne structure (avec `ett_minutes`, `project_id`, etc.)

---

## 📋 Étapes à suivre

### Étape 1 : Ouvrir Supabase SQL Editor

1. Allez sur : https://supabase.com/dashboard/project/xkwnnrhzlozhpgplxhmb/sql/new
2. Connectez-vous si nécessaire

### Étape 2 : Nettoyer la base (SUPPRIME TOUT !)

1. Ouvrez le fichier **`RESET_DATABASE.sql`** dans VS Code
2. **Sélectionnez TOUT le contenu** (Cmd+A)
3. **Copiez** (Cmd+C)
4. Dans Supabase SQL Editor, **collez** dans la zone de texte
5. Cliquez sur **"Run"** (bouton en bas à droite)
6. ✅ Attendez le message "Success. No rows returned"

> 🗑️ Votre base est maintenant complètement vide

### Étape 3 : Recréer tout proprement

1. Ouvrez le fichier **`MIGRATION_COMPLETE.sql`** dans VS Code
2. **Sélectionnez TOUT le contenu** (Cmd+A)
3. **Copiez** (Cmd+C)
4. Dans Supabase SQL Editor (même onglet), **effacez l'ancien SQL**
5. **Collez** le nouveau SQL
6. Cliquez sur **"Run"** (bouton en bas à droite)
7. ✅ Attendez le message "Success"

> ⚠️ Cette étape prend ~5-10 secondes

### Étape 4 : Vérifier que tout est bien créé

1. Dans Supabase Dashboard, allez dans **"Table Editor"** (sidebar gauche)
2. Vous devriez voir **11 tables** :
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `shooting_days`
   - ✅ `departments`
   - ✅ `decors`
   - ✅ `sequences`
   - ✅ `sequence_departments`
   - ✅ `depouillement_categories` (avec 12 catégories déjà dedans)
   - ✅ `depouillement_items`
   - ✅ `sequence_depouillement`

3. Cliquez sur la table **`sequences`**, puis sur l'onglet **"Columns"**
4. Vérifiez que vous avez bien la colonne **`ett_minutes`** ✅
5. Vérifiez que vous avez bien la colonne **`project_id`** ✅

6. Allez dans **"Storage"** (sidebar gauche)
7. Vous devriez voir un bucket **`scenarios`** ✅

---

## 🎉 C'est terminé !

Votre base de données est maintenant :
- ✅ **Propre** : Pas de doublons, pas d'anciennes policies
- ✅ **Complète** : Toutes les tables nécessaires
- ✅ **Cohérente** : Utilise `ett_minutes` comme votre code
- ✅ **Sécurisée** : RLS activé avec les bonnes policies
- ✅ **Multi-projets** : Avec `project_id` partout

---

## 🧪 Tester votre application

1. Allez sur : https://film-board-7j60ezob9-hugo-nahmias-projects.vercel.app
2. **Créez un nouveau compte** (les anciens comptes existent toujours dans auth mais n'ont plus de données)
3. **Créez un projet**
4. **Créez des jours de tournage**
5. **Créez des séquences** dans la page "Dépouillement"
6. **Ajoutez des éléments** aux séquences

Tout devrait fonctionner sans erreur 400/404/401 ! 🚀

---

## 🐛 En cas de problème

Si vous voyez encore des erreurs :

1. **Vérifiez les tables** : Table Editor → Vérifiez que toutes les 11 tables existent
2. **Vérifiez les colonnes** : Cliquez sur `sequences` → Onglet "Columns" → Cherchez `ett_minutes` et `project_id`
3. **Vérifiez Storage** : Storage → Doit avoir le bucket `scenarios`
4. **Rechargez l'application** : Faites un "Hard Refresh" (Cmd+Shift+R)

Si le problème persiste, dites-moi l'erreur exacte que vous voyez ! 👍

---

## 📊 Comparaison Avant/Après

### ❌ AVANT (problèmes)
- Colonne `estimated_duration` au lieu de `ett_minutes`
- Pas de `project_id` sur certaines tables
- Policies dupliquées
- Migration partielle

### ✅ APRÈS (propre)
- Colonne `ett_minutes` ✓
- `project_id` sur toutes les tables ✓
- Policies propres sans doublons ✓
- Migration complète ✓
- 12 catégories pré-remplies ✓

---

## 📝 Détails techniques

Cette migration crée :
- **11 tables** avec RLS activé
- **28 policies** RLS pour la sécurité
- **13 index** pour les performances
- **5 triggers** pour `updated_at` automatique
- **1 fonction** utilitaire
- **1 bucket** Storage avec policies
- **12 catégories** de dépouillement pré-remplies

Temps d'exécution total : ~10 secondes
