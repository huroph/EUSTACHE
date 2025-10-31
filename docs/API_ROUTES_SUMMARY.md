# 📊 Tableau récapitulatif - Toutes les requêtes Supabase

## 🎯 Légende
- ✅ = Route simple
- ⚠️ = Route complexe (jointures, logique métier)
- 🔥 = Route critique (utilisée dans plusieurs composants)

---

## 📋 Table des matières par composant

| Composant | Fichier | Tables utilisées | Nb requêtes |
|-----------|---------|------------------|-------------|
| ProjectList | `src/components/projects/ProjectList.tsx` | projects | 4 |
| KanbanBoard | `src/components/kanban/KanbanBoard.tsx` | shooting_days, sequences, decors | 10 |
| BaguetteView | `src/components/planning/BaguetteView.tsx` | shooting_days, sequences, decors, depouillement_categories | 11 |
| DepouillementPage | `src/components/depouillement/DepouillementPage.tsx` | sequences, decors, depouillement_categories, shooting_days | 6 |
| DepouillementCardOverlay | `src/components/depouillement/DepouillementCardOverlay.tsx` | sequences | 1 |
| TeamTab | `src/components/depouillement/Tab/TeamTab.tsx` | sequence_depouillement, depouillement_items | 7 |
| CallSheetGenerator | `src/components/kanban/CallSheetGenerator.tsx` | shooting_days, sequences | 2 |

**TOTAL : 41 requêtes Supabase à migrer**

---

## 🗂️ Requêtes par table

### Table `projects` (4 requêtes)

| # | Composant | Opération | Ligne | Détails | Route API |
|---|-----------|-----------|-------|---------|-----------|
| 1 | ProjectList | SELECT | 32 | Liste projets triés par date | `GET /api/projects` ✅ |
| 2 | ProjectList | INSERT | 51 | Créer projet | `POST /api/projects` ✅ |
| 3 | ProjectList | UPDATE | 69 | Modifier projet | `PUT /api/projects/:id` ✅ |
| 4 | ProjectList | DELETE | 89 | Supprimer projet | `DELETE /api/projects/:id` ⚠️ |

---

### Table `sequences` (22 requêtes) 🔥

| # | Composant | Opération | Ligne | Détails | Route API |
|---|-----------|-----------|-------|---------|-----------|
| 1 | KanbanBoard | SELECT | 62 | Toutes séquences du projet | `GET /api/projects/:id/kanban` 🔥 |
| 2 | KanbanBoard | INSERT | 120 | Créer séquence | `POST /api/projects/:id/sequences` 🔥 |
| 3 | KanbanBoard | UPDATE | 162 | Modifier séquence | `PUT /api/sequences/:id` 🔥 |
| 4 | KanbanBoard | UPDATE | 176 | Réordonner séquences (batch) | `PUT /api/sequences/reorder` ⚠️ |
| 5 | KanbanBoard | DELETE | 185 | Supprimer séquence | `DELETE /api/sequences/:id` ✅ |
| 6 | KanbanBoard | DELETE | 191 | Supprimer séquences du jour | (interne cascade) |
| 7 | BaguetteView | SELECT | 115 | Toutes séquences du projet | `GET /api/projects/:id/planning` 🔥 |
| 8 | BaguetteView | INSERT | 216 | Créer séquence | `POST /api/projects/:id/sequences` 🔥 |
| 9 | BaguetteView | UPDATE | 289 | Réordonner séquences | `PUT /api/sequences/reorder` ⚠️ |
| 10 | BaguetteView | UPDATE | 319 | Modifier séquence | `PUT /api/sequences/:id` 🔥 |
| 11 | BaguetteView | UPDATE | 373 | Changer jour séquence | `PUT /api/sequences/:id/move` ⚠️ |
| 12 | BaguetteView | UPDATE | 398 | Réordonner après déplacement | `PUT /api/sequences/reorder` ⚠️ |
| 13 | BaguetteView | DELETE | 422 | Supprimer séquence | `DELETE /api/sequences/:id` ✅ |
| 14 | DepouillementPage | SELECT | 146 | Toutes séquences du projet | `GET /api/projects/:id/depouillement` 🔥 |
| 15 | DepouillementPage | INSERT | 189 | Créer séquence | `POST /api/projects/:id/sequences` 🔥 |
| 16 | DepouillementPage | DELETE | 213 | Supprimer séquence | `DELETE /api/sequences/:id` ✅ |
| 17 | DepouillementPage | UPDATE | 315 | Réordonner séquences | `PUT /api/sequences/reorder` ⚠️ |
| 18 | DepouillementPage | UPDATE | 355 | Changer jour séquence | `PUT /api/sequences/:id/move` ⚠️ |
| 19 | DepouillementPage | UPDATE | 366 | Réordonner après déplacement | `PUT /api/sequences/reorder` ⚠️ |
| 20 | DepouillementCardOverlay | UPDATE | 93 | Modifier séquence | `PUT /api/sequences/:id` 🔥 |
| 21 | CallSheetGenerator | SELECT | 47 | Séquences d'un jour | `GET /api/shooting-days/:id/call-sheet` ✅ |

---

### Table `shooting_days` (8 requêtes) 🔥

| # | Composant | Opération | Ligne | Détails | Route API |
|---|-----------|-----------|-------|---------|-----------|
| 1 | KanbanBoard | SELECT | 61 | Tous jours du projet | `GET /api/projects/:id/kanban` 🔥 |
| 2 | KanbanBoard | DELETE | 194 | Supprimer jour | `DELETE /api/shooting-days/:id` ⚠️ |
| 3 | BaguetteView | SELECT | 114 | Tous jours du projet | `GET /api/projects/:id/planning` 🔥 |
| 4 | DepouillementPage | SELECT | 149 | Tous jours du projet (léger) | `GET /api/projects/:id/depouillement` 🔥 |
| 5 | DepouillementPage | INSERT | 281 | Créer jour de tournage | `POST /api/projects/:id/shooting-days` ✅ |
| 6 | CallSheetGenerator | SELECT | 46 | Un jour spécifique | `GET /api/shooting-days/:id/call-sheet` ✅ |

---

### Table `decors` (5 requêtes)

| # | Composant | Opération | Ligne | Détails | Route API |
|---|-----------|-----------|-------|---------|-----------|
| 1 | KanbanBoard | SELECT | 63 | Tous décors du projet | `GET /api/projects/:id/kanban` 🔥 |
| 2 | BaguetteView | SELECT | 116 | Tous décors du projet | `GET /api/projects/:id/planning` 🔥 |
| 3 | DepouillementPage | SELECT | 147 | Tous décors du projet | `GET /api/projects/:id/depouillement` 🔥 |

**Note** : Aucune opération CREATE/UPDATE/DELETE sur les décors. Probablement géré ailleurs ou pas encore implémenté.

---

### Table `depouillement_categories` (3 requêtes)

| # | Composant | Opération | Ligne | Détails | Route API |
|---|-----------|-----------|-------|---------|-----------|
| 1 | BaguetteView | SELECT | 117 | Toutes catégories | `GET /api/projects/:id/planning` 🔥 |
| 2 | DepouillementPage | SELECT | 148 | Toutes catégories | `GET /api/projects/:id/depouillement` 🔥 |

**Note** : Table de référence (lecture seule). Pas de CRUD.

---

### Table `sequence_depouillement` (4 requêtes)

| # | Composant | Opération | Ligne | Détails | Route API |
|---|-----------|-----------|-------|---------|-----------|
| 1 | TeamTab | INSERT | 101 | Ajouter élément dépouillement | `POST /api/sequences/:id/depouillement` ✅ |
| 2 | TeamTab | DELETE | 125 | Supprimer élément | `DELETE /api/depouillement/:id` ✅ |
| 3 | TeamTab | UPDATE | 132 | Modifier quantité | `PUT /api/depouillement/:id` ✅ |
| 4 | TeamTab | UPDATE | 151 | Modifier notes | `PUT /api/depouillement/:id` ✅ |

---

### Table `depouillement_items` (2 requêtes)

| # | Composant | Opération | Ligne | Détails | Route API |
|---|-----------|-----------|-------|---------|-----------|
| 1 | TeamTab | INSERT | 172 | Créer item personnalisé | `POST /api/depouillement-items` ✅ |
| 2 | TeamTab | DELETE | 191 | Supprimer item personnalisé | `DELETE /api/depouillement-items/:id` ✅ |

---

## 🎯 Routes API à créer - Vue consolidée

### 🟢 Routes simples (15 routes)

| Route | Méthode | Description | Priorité |
|-------|---------|-------------|----------|
| `/api/projects` | GET | Liste projets | 🔴 HIGH |
| `/api/projects` | POST | Créer projet | 🔴 HIGH |
| `/api/projects/:id` | PUT | Modifier projet | 🟡 MEDIUM |
| `/api/projects/:id` | DELETE | Supprimer projet | 🟡 MEDIUM |
| `/api/projects/:projectId/sequences` | POST | Créer séquence | 🔴 HIGH |
| `/api/sequences/:id` | PUT | Modifier séquence | 🔴 HIGH |
| `/api/sequences/:id` | DELETE | Supprimer séquence | 🟡 MEDIUM |
| `/api/projects/:projectId/shooting-days` | POST | Créer jour tournage | 🟡 MEDIUM |
| `/api/shooting-days/:id` | DELETE | Supprimer jour | 🟡 MEDIUM |
| `/api/sequences/:sequenceId/depouillement` | POST | Ajouter dépouillement | 🟢 LOW |
| `/api/depouillement/:id` | PUT | Modifier dépouillement | 🟢 LOW |
| `/api/depouillement/:id` | DELETE | Supprimer dépouillement | 🟢 LOW |
| `/api/depouillement-items` | POST | Créer item custom | 🟢 LOW |
| `/api/depouillement-items/:id` | DELETE | Supprimer item custom | 🟢 LOW |
| `/api/shooting-days/:id/call-sheet` | GET | Données feuille service | 🟢 LOW |

### 🔴 Routes complexes (5 routes)

| Route | Méthode | Description | Complexité | Priorité |
|-------|---------|-------------|------------|----------|
| `/api/projects/:id/kanban` | GET | Toutes données Kanban (3 tables) | ⚠️ Moyenne | 🔴 HIGH |
| `/api/projects/:id/planning` | GET | Toutes données Planning (4 tables) | ⚠️ Moyenne | 🔴 HIGH |
| `/api/projects/:id/depouillement` | GET | Toutes données Dépouillement (4 tables) | ⚠️ Moyenne | 🔴 HIGH |
| `/api/sequences/reorder` | PUT | Réordonner séquences (batch update) | ⚠️ Élevée | 🔴 HIGH |
| `/api/sequences/:id/move` | PUT | Changer jour + réordonner | ⚠️ Élevée | 🟡 MEDIUM |

---

## 📊 Statistiques finales

### Par priorité
- 🔴 **HIGH** : 8 routes (à faire en premier)
- 🟡 **MEDIUM** : 6 routes (importantes mais pas bloquantes)
- 🟢 **LOW** : 6 routes (features secondaires)

### Par complexité
- ✅ **Simple** : 15 routes (CRUD basique)
- ⚠️ **Complexe** : 5 routes (logique métier, batch, agrégation)

### Par table
- `sequences` : 22 requêtes (table la plus utilisée) 🔥
- `shooting_days` : 8 requêtes
- `decors` : 5 requêtes (lecture seule)
- `projects` : 4 requêtes
- `sequence_depouillement` : 4 requêtes
- `depouillement_categories` : 3 requêtes (lecture seule)
- `depouillement_items` : 2 requêtes

---

## 🚀 Plan d'implémentation recommandé

### Phase 1 : Core (Projets + Séquences) 🔴
1. `GET /api/projects`
2. `POST /api/projects`
3. `GET /api/projects/:id/kanban`
4. `POST /api/projects/:id/sequences`
5. `PUT /api/sequences/:id`

### Phase 2 : Kanban + Planning 🔴
6. `GET /api/projects/:id/planning`
7. `PUT /api/sequences/reorder`
8. `DELETE /api/sequences/:id`
9. `POST /api/projects/:id/shooting-days`
10. `PUT /api/sequences/:id/move`

### Phase 3 : Dépouillement 🟡
11. `GET /api/projects/:id/depouillement`
12. `POST /api/sequences/:id/depouillement`
13. `PUT /api/depouillement/:id`
14. `DELETE /api/depouillement/:id`

### Phase 4 : Fonctions avancées 🟢
15. `PUT /api/projects/:id`
16. `DELETE /api/projects/:id`
17. `DELETE /api/shooting-days/:id`
18. `POST /api/depouillement-items`
19. `DELETE /api/depouillement-items/:id`
20. `GET /api/shooting-days/:id/call-sheet`

---

## 📝 Notes importantes

### Opérations manquantes détectées
- ❌ Pas de CRUD pour `decors` (probablement géré manuellement en BDD)
- ❌ Pas de CRUD pour `depouillement_categories` (table de référence)
- ❌ Pas de route pour modifier un `shooting_day` (date, day_number)

### Points d'attention
- **Réordonnancement** : Beaucoup de logique de réordonnancement automatique (`order_in_day`) → à gérer côté API
- **Cascade deletes** : Supprimer un projet ou un jour doit supprimer les enfants
- **Day number** : Calculé automatiquement en fonction de l'ordre des dates
- **Permissions** : Toujours vérifier que `user_id` du projet = `userId` du token JWT

---

**Total : 20 routes API à créer pour une migration complète** ✅
