# 🔍 Audit — Synchronisation Google Calendar & Tasks (AcademiX)

> **Date :** 3 mars 2026  
> **Scope :** Backend Laravel + Frontend React + Jobs asynchrones  
> **Statut global :** ⚠️ Fonctionnel avec réserves — Plusieurs bugs et fragilités identifiés

---

## 📌 1. Vue d'ensemble de l'architecture

La fonctionnalité permet aux étudiants de :

1. **Connecter leur compte Google** via OAuth 2.0 (flux Authorization Code)
2. **Synchroniser l'emploi du temps** de leur filière vers un calendrier Google dédié "AcademiX - Emploi du Temps"
3. **Synchroniser les tâches** (création/modification/suppression) vers Google Tasks **et** Google Calendar

### Composants impliqués

| Couche                 | Fichier                                             | Rôle                                     |
| ---------------------- | --------------------------------------------------- | ---------------------------------------- |
| **Backend Service**    | `app/Services/GoogleApiService.php`                 | Service central — OAuth, Calendar, Tasks |
| **Backend Controller** | `app/Http/Controllers/Api/GoogleAuthController.php` | Endpoints OAuth + sync manuelle          |
| **Backend Observer**   | `app/Observers/TacheObserver.php`                   | Sync auto des tâches (CRUD)              |
| **Backend Observer**   | `app/Observers/EmploiTempsObserver.php`             | Déclenche job async sur modif EDT        |
| **Backend Job**        | `app/Jobs/SyncGoogleCalendarForFiliereJob.php`      | Sync Calendar pour toute la filière      |
| **Backend Model**      | `app/Models/User.php`                               | Stocke tokens Google + IDs calendrier    |
| **Backend Model**      | `app/Models/Tache.php`                              | Stocke `google_task_id`                  |
| **Backend Config**     | `config/services.php`                               | Clés Google OAuth                        |
| **Frontend Service**   | `src/services/studentService.js`                    | Appels API Google                        |
| **Frontend Page**      | `src/pages/GoogleCallbackPage.jsx`                  | Callback OAuth                           |
| **Frontend Component** | `src/components/student/StudentProfil.jsx`          | Connexion/Déconnexion/Sync Google        |
| **Frontend Component** | `src/components/student/StudentEmploiTemps.jsx`     | Bandeau statut + bouton sync             |

---

## 📌 2. Flux détaillé

### 2.1 Flux OAuth

```
Étudiant → [Profil] Clic "Connecter Google"
  → GET /api/v1/auth/google/redirect (retourne auth_url)
  → Redirect vers Google OAuth consent screen
  → Google redirige vers http://localhost:5173/auth/google/callback?code=XXX
  → Frontend lit le ?code, POST /api/v1/auth/google/callback { code }
  → Backend échange le code contre access_token + refresh_token
  → Stocke dans users.google_access_token / google_refresh_token
  → Déclenche syncEmploiTemps() immédiatement
  → Redirect vers /etudiant (onglet profil)
```

### 2.2 Flux Sync Emploi du Temps

```
syncEmploiTemps(User) :
  1. setAccessTokenForUser() → vérifie/rafraîchit le token
  2. ensureAcademiXCalendarExists() → crée ou retrouve le calendrier dédié
  3. Nettoyage : supprime TOUS les événements contenant (CM), (TD), (TP) dans le summary
  4. Récupère EmploiTempsFiliere de la filière de l'utilisateur
  5. Crée des événements récurrents (RRULE:FREQ=WEEKLY) jusqu'au 30 juin
```

### 2.3 Flux Sync Tâches (Observer)

```
TacheObserver::created/updated :
  → syncTaskToGoogle() → crée/met à jour dans Google Tasks
  → syncTaskToCalendar() → crée/met à jour comme événement Calendar (all-day)

TacheObserver::deleted :
  → deleteTaskFromGoogle() → supprime de Google Tasks
  → deleteTaskFromCalendar() → supprime l'événement Calendar
```

### 2.4 Flux auto (Modification EDT par le chef)

```
EmploiTempsObserver (created/updated/deleted) :
  → dispatch SyncGoogleCalendarForFiliereJob (delay 5s)
  → Job : pour chaque user connecté Google de la filière → syncEmploiTemps()
```

---

## 📌 3. Routes API

| Méthode  | URL                                 | Auth                     | Rôle                         |
| -------- | ----------------------------------- | ------------------------ | ---------------------------- |
| `GET`    | `/api/v1/auth/google/redirect`      | `auth:sanctum`           | Récupérer URL d'auth Google  |
| `POST`   | `/api/v1/auth/google/callback`      | `auth:sanctum`           | Échanger le code OAuth       |
| `GET`    | `/api/v1/student/google/status`     | `auth:sanctum + student` | Statut connexion Google      |
| `DELETE` | `/api/v1/student/google/disconnect` | `auth:sanctum + student` | Déconnexion Google           |
| `POST`   | `/api/v1/student/google/sync`       | `auth:sanctum + student` | Sync manuelle EDT → Calendar |

---

## ✅ 4. Points positifs

| #   | Point                                                                                              |
| --- | -------------------------------------------------------------------------------------------------- |
| 1   | **Architecture bien structurée** : séparation claire Service / Controller / Observer / Job         |
| 2   | **Idempotence des tâches Calendar** via ID déterministe (`academitache00000XXX`) — pas de doublons |
| 3   | **Refresh token géré** : renouvellement automatique du token expiré dans `setAccessTokenForUser()` |
| 4   | **Calendrier dédié** : "AcademiX - Emploi du Temps" ne pollue pas le calendrier principal          |
| 5   | **Pagination du nettoyage** : utilisation de `pageToken` pour nettoyer tous les événements         |
| 6   | **Job async avec retry** : `SyncGoogleCalendarForFiliereJob` avec 3 tentatives, backoff 60s        |
| 7   | **Observer sur EmploiTempsFiliere** : resynchronisation automatique quand le chef modifie l'EDT    |
| 8   | **Double sync des tâches** : Google Tasks (panneau latéral) + Calendar (visible dans l'agenda)     |
| 9   | **UX frontend soignée** : bandeau Google Calendar dans l'emploi du temps + section dans le profil  |
| 10  | **Tokens masqués** (`$hidden`) : les tokens Google ne fuient pas dans les réponses JSON            |
| 11  | **Gestion d'erreur gracieuse** : les erreurs de sync n'empêchent pas la création de tâches         |
| 12  | **Script de test** (`test_google.php`, `fix_google_sync.php`) pour le debug                        |

---

## 🐛 5. Bugs et problèmes identifiés

### 🔴 CRITIQUE

#### 5.1 — Sync EDT destructive : suppression/recréation à chaque appel

**Fichier :** `app/Services/GoogleApiService.php` L.116-196  
**Problème :** `syncEmploiTemps()` supprime **tous** les événements contenant `(CM)`, `(TD)`, `(TP)` puis les recrée à chaque synchronisation. Cela :

- Supprime les modifications manuelles de l'utilisateur (rappels personnalisés, couleurs, notes)
- Génère un grand nombre d'appels API inutiles (risque de quota Google API dépassé)
- Supprime des événements qui ne sont pas forcément de AcademiX (si l'utilisateur a d'autres événements avec CM/TD/TP dans le titre)

**Recommandation :** Utiliser un identifiant déterministe par événement (comme pour les tâches) au lieu du pattern delete-all/recreate. Exemple : `academixcours` + hash(filiere_id + matiere_id + jour + heure_debut + type_cours).

#### 5.2 — Commentaire trompeur : iCalUID jamais utilisée

**Fichier :** `app/Services/GoogleApiService.php` L.105  
**Problème :** Le commentaire dit "Utilise iCalUID pour l'idempotence" mais le code ne définit **aucun** `iCalUID` ni `id` sur les événements d'emploi du temps. L'idempotence n'est **pas** implémentée pour l'EDT (contrairement aux tâches).

#### 5.3 — `ensureAcademiXCalendarExists()` retourne 'primary' en mode dégradé

**Fichier :** `app/Services/GoogleApiService.php` L.81-100  
**Problème :** Si le token est invalide ou si la création échoue, la méthode retourne `'primary'`. Cela signifie que les événements de l'EDT seront écrits dans le **calendrier principal** de l'utilisateur au lieu du calendrier dédié. L'utilisateur ne saura pas pourquoi ses cours apparaissent dans son agenda principal.

**Recommandation :** Lancer une exception ou retourner `null` et interrompre la synchronisation.

#### 5.4 — Le nettoyage peut supprimer des événements hors AcademiX

**Fichier :** `app/Services/GoogleApiService.php` L.127-136  
**Problème :** Le filtre `str_contains($summary, '(CM)') || '(TD)' || '(TP)')` est trop large. Si l'utilisateur a un événement personnel intitulé "Révision maths (CM)" dans le même calendrier, il sera supprimé.

**Recommandation :** Ajouter un marqueur unique dans la description (ex: `[AcademiX-EDT]`) et filtrer dessus.

### 🟡 IMPORTANT

#### 5.5 — Observer Tâche synchrone : ralentit les requêtes CRUD

**Fichier :** `app/Observers/TacheObserver.php`  
**Problème :** Les appels `syncTaskToGoogle()` et `syncTaskToCalendar()` sont exécutés **de manière synchrone** dans l'Observer. Cela veut dire que chaque création/modification/suppression de tâche attend la réponse de Google API (latence réseau 200-500ms × 2 appels).

**Recommandation :** Dispatcher un job asynchrone comme pour `SyncGoogleCalendarForFiliereJob`.

#### 5.6 — Pas de vérification du calendrier supprimé par l'utilisateur

**Fichier :** `app/Services/GoogleApiService.php` L.86-87  
**Problème :** Si l'utilisateur supprime manuellement le calendrier "AcademiX" dans Google, le `google_calendar_id` stocké en base pointe vers un calendrier inexistant. Toutes les sync suivantes échoueront avec une erreur 404.

**Recommandation :** Ajouter un try/catch qui vérifie l'existence du calendrier via `calendars->get()` et le recrée si nécessaire.

#### 5.7 — Pas de ShouldBeUnique sur le Job de filière

**Fichier :** `app/Jobs/SyncGoogleCalendarForFiliereJob.php`  
**Problème :** Le `delay(5)` dans l'Observer est censé regrouper les modifications, mais si un chef importe 30 lignes d'emploi du temps, 30 jobs identiques seront dispatchés pour la même filière.

**Recommandation :** Implémenter `ShouldBeUnique` (Laravel) avec un `uniqueId` basé sur `$filiereId` pour dédupliquer.

#### 5.8 — Pas de gestion du Rate Limiting Google API

**Fichier :** `app/Services/GoogleApiService.php`  
**Problème :** Aucune gestion du rate limiting Google API (erreur 429). La sync en masse (filière entière + nettoyage + recréation) peut facilement dépasser les quotas.

**Recommandation :** Ajouter un backoff exponentiel et un sleep entre les appels batch.

#### 5.9 — Le callback OAuth ne valide pas `state` (CSRF)

**Fichier :** `app/Http/Controllers/Api/GoogleAuthController.php` L.30-73  
**Problème :** Le flux OAuth ne vérifie pas le paramètre `state` pour prévenir les attaques CSRF. N'importe qui peut forger un callback avec un code volé.

**Recommandation :** Générer un `state` aléatoire côté backend, le stocker en session, et le vérifier au callback.

#### 5.10 — Le `google_id` n'est jamais peuplé

**Fichier :** `app/Http/Controllers/Api/GoogleAuthController.php` L.47-56  
**Problème :** La colonne `google_id` existe dans la migration et le modèle, mais le callback ne récupère **jamais** l'ID Google de l'utilisateur (via l'API userinfo). Il reste toujours `null`.

### 🔵 MINEUR

#### 5.11 — Pas de tests unitaires/feature pour la sync Google

**Constat :** Le dossier `backend/laravel/tests/` ne contient **aucun** test pour `GoogleApiService`, `GoogleAuthController`, `TacheObserver` ou `SyncGoogleCalendarForFiliereJob`. Il n'existe que des scripts de test manuels (`test_google.php`, `fix_google_sync.php`).

**Recommandation :** Créer des tests Feature avec mock du Google Client.

#### 5.12 — `google/apiclient-services` configuré en "Empty"

**Fichier :** `composer.json` L.84-86  
**Constat :** L'option `"google/apiclient-services": ["Empty"]` désactive le chargement automatique de tous les services Google API. Si Calendar et Tasks sont utilisés manuellement (`use Google\Service\Calendar`), ça fonctionne, mais c'est fragile. Vérifier que les classes sont bien disponibles.

#### 5.13 — Timezone hardcodée

**Fichier :** `app/Services/GoogleApiService.php` L.92, L.188  
**Problème :** La timezone est hardcodée à `Africa/Porto-Novo`. Si le projet est déployé ailleurs ou si des étudiants sont dans des fuseaux différents, les horaires seront incorrects.

#### 5.14 — Les jours ne gèrent pas 'Dimanche'

**Fichier :** `app/Services/GoogleApiService.php` L.158-164, L.203  
**Problème :** Le `$dayMap` ne contient que Lundi→Samedi. Si un cours est planifié un dimanche (peu probable mais possible), une erreur PHP `Undefined array key "Dimanche"` sera levée sans être catchée.

#### 5.15 — La déconnexion Google ne révoque pas le token

**Fichier :** `app/Http/Controllers/Api/GoogleAuthController.php` L.92-103  
**Problème :** `googleDisconnect()` supprime les tokens en base mais ne les **révoque** pas côté Google (via `$client->revokeToken()`). Le token reste valide côté Google.

**Recommandation :** Appeler `$this->googleService->revokeToken()` avant de supprimer les données.

#### 5.16 — La page GoogleCallbackPage ne gère pas le cas "code déjà utilisé"

**Fichier :** `frontend/src/pages/GoogleCallbackPage.jsx`  
**Problème :** Si l'utilisateur recharge la page du callback, le code sera renvoyé mais Google refusera l'échange (code à usage unique). L'erreur s'affichera mais le message n'est pas explicite.

#### 5.17 — Le champ `google_calendar_id` manque un `google_event_id` par événement EDT

**Problème :** Contrairement aux tâches qui ont un `google_task_id` par tâche, les événements de l'emploi du temps n'ont **aucune** colonne de mapping dans `emploi_temps_filieres`. Il est donc impossible de mettre à jour ou supprimer un seul cours sans nettoyer tout le calendrier.

---

## 📌 6. Matrice de couverture fonctionnelle

| Fonctionnalité                     | Backend        | Frontend   | Observer/Job | Tests |
| ---------------------------------- | -------------- | ---------- | ------------ | ----- |
| Connexion OAuth Google             | ✅             | ✅         | —            | ❌    |
| Déconnexion Google                 | ✅ (partielle) | ✅         | —            | ❌    |
| Statut connexion Google            | ✅             | ✅         | —            | ❌    |
| Sync manuelle EDT → Calendar       | ✅             | ✅         | —            | ❌    |
| Sync auto EDT (modif chef)         | ✅             | —          | ✅           | ❌    |
| Sync tâche → Google Tasks (create) | ✅             | ✅ (toast) | ✅           | ❌    |
| Sync tâche → Calendar (create)     | ✅             | —          | ✅           | ❌    |
| Sync tâche → Google Tasks (update) | ✅             | —          | ✅           | ❌    |
| Sync tâche → Calendar (update)     | ✅             | —          | ✅           | ❌    |
| Suppression tâche → Tasks          | ✅             | —          | ✅           | ❌    |
| Suppression tâche → Calendar       | ✅             | —          | ✅           | ❌    |
| Refresh token automatique          | ✅             | —          | —            | ❌    |
| Création calendrier AcademiX       | ✅             | —          | —            | ❌    |
| Création task list AcademiX        | ✅             | —          | —            | ❌    |
| Révocation token Google            | ❌             | —          | —            | ❌    |
| Protection CSRF (state)            | ❌             | —          | —            | ❌    |

---

## 📌 7. Dépendances

| Package            | Version | Rôle                  |
| ------------------ | ------- | --------------------- |
| `google/apiclient` | `^2.19` | Client Google API PHP |
| `laravel/sanctum`  | `^4.3`  | Auth API token        |
| `axios` (frontend) | —       | Appels HTTP           |

**Variables d'environnement requises :**

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
QUEUE_CONNECTION=database
```

---

## 📌 8. Recommandations prioritaires

### ✅ Court terme — CORRIGÉ

1. ~~**Implémenter l'idempotence pour l'EDT**~~ ✅ Sync upsert avec IDs déterministes `academikcours{id}`, nettoyage orphelins ciblé.
2. ~~**Ajouter `ShouldBeUnique`**~~ ✅ `ShouldBeUnique` + `uniqueFor = 30` sur `SyncGoogleCalendarForFiliereJob`.
3. ~~**Gérer le calendrier supprimé**~~ ✅ Vérification via `calendars->get()`, re-création automatique sur 404/410.
4. ~~**Ne pas fallback sur `'primary'`**~~ ✅ `ensureAcademiXCalendarExists()` lève une `RuntimeException` si token invalide, jamais de fallback silencieux.

### ✅ Moyen terme — CORRIGÉ

5. ~~**Ajouter le paramètre `state`**~~ ✅ State HMAC-SHA256 signé avec expiration 10 min, vérifié côté backend + transmis par le frontend.
6. ~~**Rendre la sync des tâches asynchrone**~~ ✅ Nouveau job `SyncTacheToGoogleJob` dispatché depuis `TacheObserver`.
7. ~~**Révoquer le token**~~ ✅ Appel `revokeToken()` lors de la déconnexion Google.
8. **Ajouter un rate limiter** pour les appels batch à l'API Google. _(reste à faire)_

### 🔲 Long terme (qualité)

9. **Écrire des tests Feature** avec mock du Google Client (PHPUnit + Mockery).
10. **Ajouter une colonne `google_event_id`** sur `emploi_temps_filieres` pour un mapping 1:1.
11. **Ajouter le support de la synchronisation bidirectionnelle** (modifications faites sur Google Calendar → retour dans l'app).
12. **Implémenter un webhook Google Calendar** (push notifications) au lieu du polling pour la sync.

---

## 📌 9. Score de maturité (après corrections)

| Critère          | Avant     | Après                | Notes                                                      |
| ---------------- | --------- | -------------------- | ---------------------------------------------------------- |
| Fonctionnalité   | 4/5       | 4/5                  | Toutes les features principales sont là                    |
| Fiabilité        | 2/5       | **4/5**              | Sync idempotente, calendrier vérifié, job unique           |
| Sécurité         | 2/5       | **4/5**              | State CSRF HMAC, révocation token, google_id peuplé        |
| Performance      | 2/5       | **4/5**              | Tâches async, upsert au lieu de delete-all, ShouldBeUnique |
| Tests            | 1/5       | 1/5                  | Aucun test automatisé (reste à faire)                      |
| Maintenabilité   | 4/5       | **4/5**              | Code bien organisé, nouveau job dédié                      |
| **Score global** | **2.5/5** | **⭐⭐⭐⭐ (3.5/5)** |                                                            |

---

## 📌 10. Fichiers modifiés lors de la correction

| Fichier                                             | Action   | Résumé                                                                                                                                         |
| --------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/Services/GoogleApiService.php`                 | Réécrit  | Sync idempotente (upsert), IDs déterministes, vérification calendrier, timezone configurable, Dimanche, `revokeToken()`, `fetchGoogleUserId()` |
| `app/Http/Controllers/Api/GoogleAuthController.php` | Réécrit  | CSRF state HMAC-SHA256, peuplement `google_id`, révocation token                                                                               |
| `app/Observers/TacheObserver.php`                   | Réécrit  | Dispatch `SyncTacheToGoogleJob` au lieu d'appels synchrones                                                                                    |
| `app/Jobs/SyncTacheToGoogleJob.php`                 | **Créé** | Nouveau job async pour sync tâches (sync + delete)                                                                                             |
| `app/Jobs/SyncGoogleCalendarForFiliereJob.php`      | Modifié  | Ajout `ShouldBeUnique`, `uniqueFor = 30`                                                                                                       |
| `config/services.php`                               | Modifié  | Ajout `timezone` configurable (`GOOGLE_CALENDAR_TIMEZONE`)                                                                                     |
| `frontend/src/pages/GoogleCallbackPage.jsx`         | Modifié  | Lecture du `state`, `useRef` anti-doublon, transmission au backend                                                                             |
| `frontend/src/services/studentService.js`           | Modifié  | `handleGoogleCallback(code, state)` envoie le state                                                                                            |

---

_Rapport généré automatiquement — Audit AcademiX Google Sync — Mis à jour après corrections_
