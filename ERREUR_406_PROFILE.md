# 🚨 Erreur 406 - Profile Creation Error

## Problème

Votre ami essaie de créer un compte et reçoit :
- **Erreur 406** : Failed to load
- **Message** : Profile creation error

## ❌ Cause

La base de données en production **n'a pas encore été migrée** !

Les tables n'existent pas encore :
- ❌ Table `profiles` manquante
- ❌ Table `projects` manquante
- ❌ Toutes les autres tables manquantes

Quand quelqu'un crée un compte :
1. ✅ Supabase Auth crée l'utilisateur → OK
2. ❌ Votre code essaie de créer le profil → ERREUR (table n'existe pas)
3. ❌ Page 406 → Échec

## ✅ Solution

**Vous DEVEZ exécuter la migration !**

### Étape 1 : Exécutez RESET_DATABASE.sql

1. Allez sur : https://supabase.com/dashboard/project/xkwnnrhzlozhpgplxhmb/sql/new
2. Ouvrez le fichier **`RESET_DATABASE.sql`** dans VS Code
3. Copiez TOUT le contenu (Cmd+A puis Cmd+C)
4. Collez dans Supabase SQL Editor
5. Cliquez sur **"Run"**
6. ✅ Attendez "Success"

### Étape 2 : Exécutez MIGRATION_COMPLETE.sql

1. Dans le même onglet Supabase SQL Editor
2. Ouvrez le fichier **`MIGRATION_COMPLETE.sql`** dans VS Code
3. Copiez TOUT le contenu (Cmd+A puis Cmd+C)
4. Effacez l'ancien SQL et collez le nouveau
5. Cliquez sur **"Run"**
6. ✅ Attendez "Success" (~10 secondes)

### Étape 3 : Vérifiez

1. Allez dans **Table Editor** (sidebar gauche)
2. Vérifiez que vous voyez **11 tables** :
   - ✅ profiles
   - ✅ projects
   - ✅ shooting_days
   - ✅ departments
   - ✅ decors
   - ✅ sequences
   - ✅ sequence_departments
   - ✅ depouillement_categories
   - ✅ depouillement_items
   - ✅ sequence_depouillement

### Étape 4 : Demandez à votre ami de réessayer

1. Votre ami doit **recharger la page** (Cmd+Shift+R)
2. Créer un nouveau compte
3. ✅ Ça devrait fonctionner maintenant !

---

## 🔧 Correction apportée

J'ai aussi ajouté un **trigger automatique** dans la migration :

```sql
-- Créer automatiquement le profil quand un user s'inscrit
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

Maintenant, dès qu'un utilisateur crée un compte :
1. ✅ Auth.users → créé par Supabase
2. ✅ Profiles → créé automatiquement par le trigger
3. ✅ Pas d'erreur 406 !

---

## ⚠️ Important

**Vous NE POUVEZ PAS utiliser l'application en production tant que la migration n'est pas exécutée.**

Personne ne pourra :
- ❌ Créer de compte (erreur 406)
- ❌ Se connecter (erreur 401)
- ❌ Voir des projets (erreur 400)

**Action IMMÉDIATE** : Exécutez les 2 fichiers SQL maintenant !

---

## 📚 Pour plus de détails

Consultez le **`GUIDE_MIGRATION_PROPRE.md`** pour un guide complet pas-à-pas.

---

## 🎉 Après la migration

Une fois la migration exécutée :
- ✅ Votre ami pourra créer son compte
- ✅ Vous pourrez créer des projets
- ✅ L'application fonctionnera normalement
- ✅ Chaque user verra uniquement ses propres données (RLS)

**Temps estimé** : 2 minutes pour tout migrer
