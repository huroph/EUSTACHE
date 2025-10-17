#!/bin/bash

# ====================================================================
# 🎬 Script de commit de la migration propre
# ====================================================================

echo ""
echo "🎬 FilmBoard - Commit de la migration propre"
echo "============================================="
echo ""

# Ajouter les nouveaux fichiers
echo "📦 Ajout des nouveaux fichiers..."
git add RESET_DATABASE.sql
git add MIGRATION_COMPLETE.sql
git add GUIDE_MIGRATION_PROPRE.md
git add MIGRATION_RECAP.md
git add supabase/migrations/README.md
git add supabase/migrations/20251012000000_reset.sql
git add supabase/migrations/20251012000000_complete_schema.sql
git add supabase/migrations/archive/

echo "✅ Fichiers ajoutés"
echo ""

# Afficher le statut
echo "📊 Statut Git :"
git status --short
echo ""

# Commit
echo "💾 Création du commit..."
git commit -m "♻️ Migration complète et propre de la base de données

Reconstruction complète depuis zéro avec structure propre

✨ Nouveaux fichiers :
- RESET_DATABASE.sql : Nettoyage complet de la DB
- MIGRATION_COMPLETE.sql : Migration complète (11 tables + Storage)
- GUIDE_MIGRATION_PROPRE.md : Guide pas-à-pas illustré
- MIGRATION_RECAP.md : Récapitulatif technique détaillé

🗂️ Réorganisation :
- Anciennes migrations archivées dans supabase/migrations/archive/
- Nouvelle structure propre dans supabase/migrations/

✅ Corrections :
- Colonne 'ett_minutes' (au lieu de estimated_duration)
- Colonne 'project_id' sur toutes les tables nécessaires
- 12 catégories de dépouillement pré-remplies
- RLS policies sans doublons (avec DROP IF EXISTS)
- Storage bucket 'scenarios' inclus

🧹 Nettoyage :
- Suppression des anciens fichiers de migration fragmentés
- Suppression des guides obsolètes

📊 Résultat :
- 2 fichiers SQL clairs et complets
- Base de données cohérente avec le code TypeScript
- Prêt pour déploiement en production"

echo ""
echo "✅ Commit créé"
echo ""

# Afficher le dernier commit
echo "📝 Dernier commit :"
git log -1 --oneline
echo ""

echo "🚀 Prochaines étapes :"
echo "1. Exécuter : git push origin main"
echo "2. Ouvrir : GUIDE_MIGRATION_PROPRE.md"
echo "3. Suivre les instructions pour migrer la DB"
echo ""
