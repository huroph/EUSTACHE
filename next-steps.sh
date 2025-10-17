#!/bin/bash

echo "🚀 CONFIGURATION ENVIRONNEMENTS FILMBOARD"
echo "=========================================="
echo ""

echo "📍 STATUT ACTUEL:"
echo "  ✅ Fichiers d'environnement créés"
echo "  ✅ .gitignore mis à jour"
echo "  ✅ Code Supabase amélioré avec logs"
echo "  ✅ Scripts npm ajoutés"
echo ""

echo "📋 PROCHAINES ÉTAPES À FAIRE:"
echo ""
echo "1️⃣  CRÉER UN PROJET SUPABASE PRODUCTION"
echo "   👉 https://supabase.com/dashboard"
echo "   - Cliquez sur 'New Project'"
echo "   - Nom: filmboard-production"
echo "   - Sauvegardez le mot de passe!"
echo ""

echo "2️⃣  RÉCUPÉRER LES CLÉS PRODUCTION"
echo "   Dans le nouveau projet:"
echo "   - Settings > API"
echo "   - Copiez Project URL et anon key"
echo ""

echo "3️⃣  METTRE À JOUR .env.production"
echo "   Éditez le fichier et remplacez les valeurs"
echo ""

echo "4️⃣  SUPPRIMER LES ANCIENNES VARIABLES VERCEL"
echo "   vercel env rm VITE_SUPABASE_URL production"
echo "   vercel env rm VITE_SUPABASE_ANON_KEY production"
echo ""

echo "5️⃣  AJOUTER LES NOUVELLES VARIABLES VERCEL"
echo "   vercel env add VITE_SUPABASE_URL production"
echo "   vercel env add VITE_SUPABASE_ANON_KEY production"
echo ""

echo "6️⃣  MIGRER LA BASE DE DONNÉES"
echo "   Copiez le fichier:"
echo "   supabase/migrations/20251011133627_create_filmboard_schema.sql"
echo "   Et exécutez-le dans SQL Editor du projet PROD"
echo ""

echo "7️⃣  CONFIGURER L'AUTHENTIFICATION SUPABASE PROD"
echo "   - Authentication > URL Configuration"
echo "   - Site URL: https://votre-app.vercel.app"
echo "   - Redirect URLs: https://votre-app.vercel.app/**"
echo ""

echo "8️⃣  DÉPLOYER EN PRODUCTION"
echo "   npm run deploy"
echo ""

echo "📖 Pour plus de détails, consultez:"
echo "   SETUP_ENVIRONMENTS.md"
echo ""

echo "🔍 VÉRIFICATION EN LOCAL:"
echo "   npm run dev"
echo "   → Devrait afficher dans la console:"
echo "   🔧 Environment: development"
echo "   🔗 Supabase URL: ✅ Configured"
echo ""
