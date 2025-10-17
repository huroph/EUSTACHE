# 🔒 Sécurité des Fichiers Scénarios

## Principe de sécurité

Les scénarios de film sont des documents **confidentiels** qui ne doivent **JAMAIS** être accessibles publiquement.

## ✅ Architecture sécurisée mise en place

### 1. **Bucket Privé**
```sql
public: false  -- ❌ Aucun accès public
```

### 2. **Row Level Security (RLS)**
Chaque fichier est organisé par user_id :
```
scenarios/
  └── {user_id}/
      └── {timestamp}.pdf
```

**Policies appliquées** :
- ✅ Un utilisateur peut **lire** uniquement SES propres fichiers
- ✅ Un utilisateur peut **uploader** uniquement dans SON dossier
- ✅ Un utilisateur peut **supprimer** uniquement SES propres fichiers
- ❌ Aucun accès aux fichiers des autres utilisateurs

### 3. **URLs Signées (Signed URLs)**

**Principe** :
- Les URLs de fichiers ne sont **PAS** stockées en base de données
- Seul le **chemin relatif** est stocké : `user_id/timestamp.pdf`
- Une **URL temporaire signée** est générée à la demande

**Avantages** :
- 🔐 L'URL expire après 1 heure
- 🔐 L'URL contient une signature cryptographique
- 🔐 Impossible de deviner ou modifier l'URL
- 🔐 Même si quelqu'un vole l'URL, elle expirera rapidement

**Code** :
```typescript
const { data: signedUrlData } = await supabase.storage
  .from('scenarios')
  .createSignedUrl(filePath, 3600); // 3600 secondes = 1 heure
```

### 4. **Flux de sécurité**

```
┌─────────────────────────────────────────────────────────┐
│ 1. UPLOAD                                                │
├─────────────────────────────────────────────────────────┤
│ User upload PDF → Stocké dans "scenarios/{user_id}/"    │
│                → Chemin stocké en BDD (pas l'URL)       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. AFFICHAGE                                             │
├─────────────────────────────────────────────────────────┤
│ User ouvre Dépouillement                                 │
│       ↓                                                  │
│ Backend vérifie: user_id match ?                        │
│       ↓                                                  │
│ Génération URL signée (valide 1h)                       │
│       ↓                                                  │
│ PDF affiché dans le viewer                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. TENTATIVE D'ACCÈS NON AUTORISÉ                       │
├─────────────────────────────────────────────────────────┤
│ Utilisateur B essaye d'accéder au fichier de User A     │
│       ↓                                                  │
│ RLS Policy vérifie: auth.uid() == folder owner ?        │
│       ↓                                                  │
│ ❌ ACCÈS REFUSÉ                                          │
└─────────────────────────────────────────────────────────┘
```

## 🛡️ Comparaison : Public vs Privé

### ❌ Approche PUBLIQUE (mauvaise)
```typescript
// URL publique permanente
const { data: { publicUrl } } = supabase.storage
  .from('scenarios')
  .getPublicUrl(filePath);

// ❌ Problèmes :
// - URL permanente et prévisible
// - Accessible à TOUS (même non authentifiés)
// - Si l'URL fuite → le scénario est accessible pour toujours
// - Exemple : https://xyz.supabase.co/storage/v1/object/public/scenarios/user123/film.pdf
```

### ✅ Approche PRIVÉE (correcte)
```typescript
// URL signée temporaire
const { data } = await supabase.storage
  .from('scenarios')
  .createSignedUrl(filePath, 3600);

// ✅ Avantages :
// - URL complexe avec token cryptographique
// - Expire après 1 heure
// - Accessible uniquement par le propriétaire
// - Exemple : https://xyz.supabase.co/storage/v1/object/sign/scenarios/user123/film.pdf?token=eyJhbGc...
```

## 🔄 Gestion de l'expiration

**Que se passe-t-il après 1 heure ?**

1. L'URL signée expire automatiquement
2. Si l'utilisateur est toujours dans le Dépouillement :
   - Le PDF continue de s'afficher (déjà chargé dans le navigateur)
3. Si l'utilisateur recharge la page :
   - Une nouvelle URL signée est générée automatiquement
   - Le PDF est à nouveau accessible

**Amélioration possible** :
```typescript
// Régénérer l'URL toutes les 50 minutes
useEffect(() => {
  const interval = setInterval(() => {
    loadProject(); // Régénère l'URL signée
  }, 50 * 60 * 1000); // 50 minutes

  return () => clearInterval(interval);
}, []);
```

## 📊 Données stockées en base

### Table `projects`
```sql
id: uuid
user_id: uuid              -- Propriétaire du projet
title: text
scenario_file: text        -- ⚠️ CHEMIN RELATIF, PAS L'URL !
                           -- Exemple: "user123/1697123456.pdf"
start_date: date
end_date: date
```

**Important** :
- ✅ Stocké : `"abc123-def456/1697123456.pdf"` (chemin relatif)
- ❌ **JAMAIS** stocké : `"https://...supabase.co/.../file.pdf"` (URL complète)

## 🚨 Scénarios d'attaque et protections

### Attaque 1 : Vol d'URL
**Scénario** : Un attaquant intercepte l'URL signée

**Protection** :
- ⏰ L'URL expire après 1 heure
- 🔐 L'URL contient un token cryptographique non rejouable
- 👤 Le bucket vérifie quand même l'identité de l'utilisateur

### Attaque 2 : Énumération de fichiers
**Scénario** : Un attaquant essaye de lister tous les fichiers

**Protection** :
- 🚫 Les policies RLS bloquent l'accès
- 👁️ Seuls les fichiers du user connecté sont visibles
- 📁 La structure des dossiers est basée sur les UUID (impossibles à deviner)

### Attaque 3 : Accès direct au Storage
**Scénario** : Un attaquant essaye d'accéder directement au bucket

**Protection** :
- 🔒 Bucket privé (public: false)
- 🛡️ RLS policies sur storage.objects
- ✅ Authentification obligatoire

## 🎯 Bonnes pratiques appliquées

1. ✅ **Principe du moindre privilège**
   - Chaque user ne voit QUE ses fichiers

2. ✅ **Défense en profondeur**
   - Bucket privé + RLS + URLs signées

3. ✅ **Séparation par tenant**
   - Chaque user a son propre dossier

4. ✅ **Expiration des accès**
   - URLs temporaires (1 heure)

5. ✅ **Validation côté serveur**
   - Supabase vérifie les permissions à chaque requête

## 📝 Checklist de sécurité

- [x] Bucket créé en mode privé (public: false)
- [x] RLS activée sur storage.objects
- [x] Policy INSERT : user peut uploader dans son dossier uniquement
- [x] Policy SELECT : user peut lire ses fichiers uniquement
- [x] Policy UPDATE : user peut modifier ses fichiers uniquement
- [x] Policy DELETE : user peut supprimer ses fichiers uniquement
- [x] URLs signées utilisées (pas d'URLs publiques)
- [x] Chemin relatif stocké en BDD (pas l'URL complète)
- [x] Durée d'expiration raisonnable (1 heure)

## 🔮 Améliorations futures possibles

1. **Watermarking dynamique**
   - Ajouter le nom de l'utilisateur sur chaque page du PDF

2. **Audit logging**
   - Logger chaque accès aux scénarios

3. **Partage sécurisé**
   - Permettre le partage temporaire avec d'autres users
   - Génération de liens avec expiration courte

4. **Chiffrement côté client**
   - Chiffrer le PDF avant upload
   - Déchiffrer dans le navigateur

5. **DRM (Digital Rights Management)**
   - Empêcher le téléchargement/impression
   - Watermark visible non supprimable
