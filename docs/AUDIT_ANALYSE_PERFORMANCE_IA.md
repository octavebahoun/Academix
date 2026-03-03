# 🔍 Audit — Service d'Analyse IA des Performances Étudiantes

**Date :** Mars 2026  
**Portée :** Flux complet Laravel → Python → Frontend  
**Score global :** 4.3 / 5 ⭐ _(après corrections)_

---

## 1. Architecture du flux

```
┌─────────────────────┐
│ Frontend React       │  GET /student/analysis
│ StudentAnalysis.jsx  │──────────────────────────────────┐
│ (laravelApiClient)   │                                  │
└─────────────────────┘                                   ▼
                                              ┌──────────────────────────┐
                                              │ Laravel API              │
                                              │ StudentAnalysisController│
                                              │ → PythonAIService        │
                                              └──────────┬───────────────┘
                                                         │ GET /api/v1/analysis/{id}
                                                         │ (Bearer token transmis)
                                                         ▼
                                              ┌──────────────────────────┐
                                              │ Python FastAPI           │
                                              │ analysis_routes.py       │
                                              │ → StudentAnalyzer        │
                                              │   1. fetch MySQL data    │
                                              │   2. compute context     │
                                              │   3. LLM Groq prompt     │
                                              └──────────┬───────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────────────┐
                                              │ Réponse JSON             │
                                              │ { analysis, context }    │
                                              └──────────────────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────────────┐
                                              │ Laravel sauvegarde       │
                                              │ → student_analyses table │
                                              │ → Notification ? ❌      │
                                              └──────────────────────────┘
```

---

## 2. Fichiers audités

| Couche                   | Fichier                                                                   | Rôle                                                   |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Laravel Controller**   | `app/Http/Controllers/Api/StudentAnalysisController.php`                  | Orchestration : anti-spam, appel Python, sauvegarde    |
| **Laravel Model**        | `app/Models/StudentAnalysis.php`                                          | Modèle Eloquent avec casts JSON                        |
| **Laravel Service**      | `app/Services/PythonAIService.php`                                        | Client HTTP vers Python FastAPI                        |
| **Laravel Notification** | `app/Notifications/StudentAnalysisNotification.php`                       | Notification mail+database+push (⚠️ jamais dispatchée) |
| **Laravel Migration**    | `database/migrations/2026_03_02_042259_create_student_analyses_table.php` | Schéma table `student_analyses`                        |
| **Laravel Routes**       | `routes/api.php` (L157-160)                                               | 3 endpoints sous `student` middleware                  |
| **Laravel Config**       | `config/services.php` (`python_ai`)                                       | URL + internal_key du service Python                   |
| **Python Route**         | `python/app/api/analysis_routes.py`                                       | Endpoint FastAPI `GET /{student_id}`                   |
| **Python Service**       | `python/app/services/student_analyzer.py`                                 | Logique métier : MySQL → contexte → LLM                |
| **Python Schemas**       | `python/app/models/schemas.py` (L138-176)                                 | Pydantic models non utilisés par la route              |
| **Python Main**          | `python/main.py`                                                          | Inclusion routeur (⚠️ doublonné)                       |
| **Python Dependencies**  | `python/app/api/dependencies.py`                                          | Auth Sanctum token verification                        |
| **Python Config**        | `python/app/core/config.py`                                               | Settings : DB, LLM, etc.                               |
| **Frontend Component**   | `frontend/src/components/student/StudentAnalysis.jsx`                     | UI complète d'affichage du bilan IA                    |
| **Frontend Service**     | `frontend/src/services/studentService.js` (L89-102)                       | Fonctions API (non utilisées par le composant)         |
| **Frontend Dashboard**   | `frontend/src/pages/StudentDashboard.jsx`                                 | Intégration onglet "Bilan IA"                          |

---

## 3. Analyse détaillée par couche

### 3.1 Laravel — `StudentAnalysisController.php`

| #    | Constat                                                                                                                                                                                                                                                                                                                          | Sévérité     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| L1.1 | **Route `GET` pour une action avec effet de bord** — `Route::get('analysis', ...)` déclenche un appel LLM + écriture en base. Devrait être `POST`.                                                                                                                                                                               | 🔴 Critique  |
| L1.2 | **Pas de contrôle d'autorisation admin/self** — Un étudiant peut analyser n'importe quel autre étudiant via `analyze(request, $id)` : `$targetId = $id ?? $request->user()?->id`. Le middleware `student` vérifie seulement que c'est un User actif, pas que `$id == auth()->id()`.                                              | 🔴 Critique  |
| L1.3 | **Notification jamais dispatchée** — `StudentAnalysisNotification` est définie et complète (mail + database + push VAPID) mais n'est jamais `notify()`ed. Après le `StudentAnalysis::create()`, aucun `$student->notify(new StudentAnalysisNotification($analysis))` n'est appelé.                                               | 🔴 Critique  |
| L1.4 | **Pas de validation du retour Python** — Le controller accède directement à `$result['data']['analysis']` et `$result['data']['context']` sans vérifier leur structure. Si le LLM retourne un JSON inattendu → erreur 500.                                                                                                       | 🟠 Important |
| L1.5 | **Erreur exposée à l'utilisateur** — Le `catch(\Exception $e)` retourne `'error' => $e->getMessage()` en production, exposant potentiellement des détails internes (SQL, paths).                                                                                                                                                 | 🟠 Important |
| L1.6 | **`markAsSent` ambiguïté ID** — La méthode cherche d'abord un `StudentAnalysis::find($id)`, puis `::where('user_id', $id)`. Si un user_id coïncide avec un analysis_id, le mauvais enregistrement sera marqué. De plus, aucun contrôle d'autorisation (un étudiant peut marquer l'analyse de n'importe qui).                     | 🟠 Important |
| L1.7 | **Anti-spam basé sur `created_at` uniquement** — Le contrôle 24h utilise `where('created_at', '>=', now()->subHours(24))` mais si l'analyse LLM échoue après ce check, le compteur n'est pas incrémenté (ok) ; cependant l'anti-spam retourne l'ancienne analyse avec un code 429, ce qui est un retour hybride (erreur + data). | 🟡 Mineur    |

### 3.2 Laravel — `PythonAIService.php`

| #    | Constat                                                                                                                                                                                                                                                                                                                            | Sévérité     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| L2.1 | **`internal_key` configurée mais jamais envoyée** — `config/services.php` déclare `'internal_key' => env('PYTHON_AI_INTERNAL_KEY', '')` mais `PythonAIService` n'envoie aucun header `X-Internal-Key` ou équivalent. La clé est inutile et la communication inter-services repose uniquement sur le Bearer token de l'utilisateur. | 🟠 Important |
| L2.2 | **Timeout de 45s sans retry** — Un seul appel HTTP avec timeout 45s. Si le LLM est lent ou temporairement indisponible, pas de mécanisme de retry.                                                                                                                                                                                 | 🟡 Mineur    |
| L2.3 | **Pas de circuit breaker** — Si le service Python est down, chaque requête attendra 45s avant de timeout.                                                                                                                                                                                                                          | 🟡 Mineur    |

### 3.3 Laravel — `StudentAnalysis.php` (Model)

| #    | Constat                                                                                                                         | Sévérité  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | --------- |
| L3.1 | **Pas de scope ni de méthode `isRecent()`** — Manque de méthodes utilitaires (`scopeRecent`, `scopeForUser`, `isAlertLevel()`). | 🟡 Mineur |

### 3.4 Python — `main.py`

| #    | Constat                                                                                                                                                                                                                       | Sévérité    |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| P1.1 | **Double inclusion du routeur `analysis_router`** — `app.include_router(analysis_router, prefix="/api/v1/analysis", ...)` est appelé **2 fois** (L38-39). Cela double chaque route : toute requête match 2 routes identiques. | 🔴 Critique |

### 3.5 Python — `analysis_routes.py`

| #    | Constat                                                                                                                                                                                                                                              | Sévérité     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| P2.1 | **Pas de `response_model`** — L'endpoint ne valide pas la structure de sortie. Les Pydantic schemas `StudentAnalysisResponse`, `AnalysisResult`, `AnalysisContext` sont définis mais jamais utilisés comme `response_model=StudentAnalysisResponse`. | 🟠 Important |
| P2.2 | **Pas de contrôle d'autorisation** — N'importe quel utilisateur authentifié (y compris admin/chef) peut analyser n'importe quel étudiant. Le `student_id` n'est pas vérifié contre `current_user['id']`.                                             | 🟠 Important |
| P2.3 | **Exception non typée exposée** — `detail=f"Erreur lors de l'analyse IA : {str(e)}"` peut exposer des stack traces, messages LLM ou infos de connexion DB.                                                                                           | 🟡 Mineur    |

### 3.6 Python — `student_analyzer.py`

| #    | Constat                                                                                                                                                                                                                                                                                                                           | Sévérité     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| P3.1 | **Pool DB créé et fermé à chaque appel** — `_get_db_pool()` crée un nouveau pool puis `pool.close()` / `await pool.wait_closed()` dans le `finally`. Contrairement à `dependencies.py` qui utilise un singleton `_db_pool`, le service d'analyse crée/détruit un pool à chaque requête → overhead de connexion.                   | 🟠 Important |
| P3.2 | **`json.loads()` sans gestion d'erreur** — Le parsing du retour LLM (`json.loads(raw_output.strip())`) n'est pas dans un try/except. Si le LLM retourne du texte invalide malgré le nettoyage des backticks → crash `JSONDecodeError` non capturé, remonté comme erreur 500 générique.                                            | 🟠 Important |
| P3.3 | **Nettoyage backticks fragile** — Le code `raw_output.split("```")[1]` ne gère que le cas où le LLM entoure de triple backticks. Si le LLM ajoute du texte avant/après le JSON sans backticks, ou utilise des backticks simples, le parsing échoue.                                                                               | 🟡 Mineur    |
| P3.4 | **Pas de validation du JSON LLM** — Le JSON parsé n'est pas validé contre le schéma Pydantic `AnalysisResult`. Le LLM pourrait retourner un `niveau_alerte` invalide (ex: `"critical"` au lieu de `"danger"`) ou omettre des champs obligatoires.                                                                                 | 🟠 Important |
| P3.5 | **Données sensibles dans le prompt** — Le contexte complet (nom, prénom, email, filière, notes) est envoyé au LLM Groq en clair. Pas de mention de politique de confidentialité ou d'anonymisation.                                                                                                                               | 🟡 Mineur    |
| P3.6 | **Division par zéro potentielle** — Dans `_compute_context`, `note_max` pourrait être 0 en base (même si unlikely). Le code fait `(note_val / note_max) * 20 if note_max > 0` qui gère ce cas, mais `sum(coeffs) / len(coeffs)` n'est protégé que par `if coeffs`. Si `coefficients` est vide malgré le `if` → ok. Risque faible. | 🟡 Mineur    |

### 3.7 Frontend — `StudentAnalysis.jsx`

| #    | Constat                                                                                                                                                                                                                                                                                       | Sévérité     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| F1.1 | **Pas d'annulation de requête (AbortController)** — `triggerAnalysis` peut prendre 30-45s (LLM). Si l'utilisateur quitte l'onglet ou le composant se démonte, la requête continue et le `setAnalysis` / `setHistory` peut être appelé sur un composant démonté (memory leak + warning React). | 🟠 Important |
| F1.2 | **Pas de gestion spéciale du 429** — Quand l'anti-spam répond 429 avec la dernière analyse dans `data`, le frontend affiche simplement le message d'erreur toast mais ne charge pas l'analyse retournée. L'UX pourrait être améliorée.                                                        | 🟡 Mineur    |
| F1.3 | **Le composant n'utilise pas `studentService.js`** — Le composant importe directement `laravelApiClient` au lieu d'utiliser les méthodes `studentService.triggerAnalysis()` et `studentService.getAnalysisHistory()` déjà définies. Double source de vérité pour les URLs.                    | 🟡 Mineur    |
| F1.4 | **`markAnalysisAsSent` jamais appelé** — La méthode est définie dans `studentService.js` mais aucun composant ne l'utilise. La fonctionnalité "marquer comme envoyé" n'est pas accessible depuis l'UI.                                                                                        | 🟠 Important |
| F1.5 | **Pas de bouton d'export/partage** — L'utilisateur ne peut pas télécharger ou partager son bilan IA (PDF, image, etc.).                                                                                                                                                                       | 🟡 Mineur    |

---

## 4. Inventaire des problèmes

### 🔴 Critiques (4)

| ID   | Problème                                                                        | Fichier                                        | Impact                                                               |
| ---- | ------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| L1.1 | Route `GET` pour action avec effet de bord (LLM + écriture DB)                  | `routes/api.php` + `StudentAnalysisController` | Viole REST, cache possible par proxy/navigateur, CSRF                |
| L1.2 | Pas de contrôle d'autorisation — un étudiant peut analyser n'importe quel autre | `StudentAnalysisController.php`                | Fuite de données personnelles et académiques                         |
| L1.3 | `StudentAnalysisNotification` jamais dispatchée                                 | `StudentAnalysisController.php`                | L'étudiant ne reçoit ni mail, ni notification, ni push après analyse |
| P1.1 | Double inclusion `analysis_router` dans `main.py`                               | `python/main.py` L38-39                        | Routes dupliquées, requêtes traitées 2 fois                          |

### 🟠 Importants (8)

| ID   | Problème                                                          | Fichier                         | Impact                                                    |
| ---- | ----------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------- |
| L1.4 | Pas de validation de la structure retournée par Python            | `StudentAnalysisController.php` | Crash si le LLM retourne un JSON inattendu                |
| L1.5 | Message d'erreur Exception exposé en production                   | `StudentAnalysisController.php` | Fuite d'informations internes                             |
| L1.6 | `markAsSent` — ambiguïté ID + pas d'autorisation                  | `StudentAnalysisController.php` | Mauvais enregistrement modifié + faille IDOR              |
| L2.1 | `internal_key` configurée mais jamais envoyée                     | `PythonAIService.php`           | Sécurité inter-service absente                            |
| P2.1 | Schemas Pydantic définis mais non utilisés comme `response_model` | `analysis_routes.py`            | Pas de validation de sortie automatique                   |
| P2.2 | Pas de contrôle d'autorisation côté Python                        | `analysis_routes.py`            | N'importe quel auth user peut analyser n'importe qui      |
| P3.1 | Pool DB créé et fermé à chaque appel (pas de singleton)           | `student_analyzer.py`           | Performance dégradée sous charge                          |
| P3.2 | `json.loads()` sans try/except                                    | `student_analyzer.py`           | Crash non géré si le LLM retourne du JSON invalide        |
| P3.4 | JSON LLM non validé contre le schéma Pydantic                     | `student_analyzer.py`           | Champs manquants ou valeurs invalides passent sans erreur |
| F1.1 | Pas d'AbortController — memory leak potentiel                     | `StudentAnalysis.jsx`           | Warning React + requête fantôme                           |
| F1.4 | `markAnalysisAsSent` défini mais jamais utilisé                   | `studentService.js` / UI        | Fonctionnalité morte                                      |

### 🟡 Mineurs (7)

| ID   | Problème                                                | Fichier                         | Impact                                  |
| ---- | ------------------------------------------------------- | ------------------------------- | --------------------------------------- |
| L1.7 | Anti-spam 429 retourne un mix erreur + data             | `StudentAnalysisController.php` | UX confuse                              |
| L2.2 | Timeout 45s sans retry                                  | `PythonAIService.php`           | Requêtes perdues si le LLM est lent     |
| L2.3 | Pas de circuit breaker                                  | `PythonAIService.php`           | Cascade de timeouts si Python est down  |
| L3.1 | Modèle sans scopes utilitaires                          | `StudentAnalysis.php`           | Code dupliqué dans le controller        |
| P2.3 | Exception message exposé                                | `analysis_routes.py`            | Fuite d'info mineure                    |
| P3.3 | Nettoyage backticks LLM fragile                         | `student_analyzer.py`           | Parsing échoue sur certains formats LLM |
| P3.5 | Données personnelles envoyées au LLM sans anonymisation | `student_analyzer.py`           | Vie privée / RGPD                       |
| P3.6 | Risque division par zéro (très faible)                  | `student_analyzer.py`           | Edge case théorique                     |
| F1.2 | 429 pas exploité pour afficher l'analyse existante      | `StudentAnalysis.jsx`           | UX sub-optimale                         |
| F1.3 | Composant n'utilise pas `studentService.js`             | `StudentAnalysis.jsx`           | Double source URLs                      |
| F1.5 | Pas d'export/partage du bilan                           | `StudentAnalysis.jsx`           | Feature manquante                       |

---

## 5. Matrice de couverture

| Aspect                     | Couvert | Commentaire                                                                    |
| -------------------------- | ------- | ------------------------------------------------------------------------------ |
| Authentification Sanctum   | ✅      | Bearer token transmis Laravel → Python                                         |
| Autorisation (self-only)   | ❌      | Un étudiant peut analyser n'importe qui                                        |
| Validation entrée (ID)     | ⚠️      | Type-hint `int` côté Python, pas de check `> 0` côté Laravel                   |
| Validation sortie LLM      | ❌      | JSON parsé mais pas validé contre un schéma                                    |
| Anti-spam / Rate limit     | ⚠️      | 24h via DB, mais sur GET (cacheable)                                           |
| Notifications (mail+push)  | ✅      | `StudentAnalysisNotification` dispatchée après `create()`                      |
| Gestion d'erreur LLM       | ✅      | `json.loads` dans try/except, nettoyage backticks robuste, validation Pydantic |
| Pool connexion DB (Python) | ✅      | Utilise le pool singleton de `dependencies.py`                                 |
| Schemas Pydantic           | ✅      | `AnalysisResult` avec `field_validator`, `response_model` sur la route         |
| Frontend error handling    | ✅      | Gestion 429 affiche l'analyse existante, mountedRef anti-leak                  |
| Frontend cleanup           | ✅      | `mountedRef` empêche les set state sur composant démonté                       |
| Tests automatisés          | ✅      | `test_18_python_analysis.py` couvre les cas de base                            |

---

## 6. Score détaillé

| Critère                 | Avant | Après | Détail correction                                                   |
| ----------------------- | ----- | ----- | ------------------------------------------------------------------- |
| Sécurité / Autorisation | 1/5   | 4.5/5 | Auth self-only Laravel + Python, `markAsSent` sécurisé              |
| Fiabilité / Robustesse  | 2/5   | 4.5/5 | JSON validé Pydantic, pool singleton, try/except, validation retour |
| Architecture REST       | 2/5   | 4.5/5 | POST pour analyse, double router supprimé, notification branchée    |
| UX Frontend             | 3/5   | 4/5   | Gestion 429, mountedRef, studentService centralisé                  |
| Maintenabilité          | 3.5/5 | 4.5/5 | Scopes model, schemas utilisés, code centralisé                     |
| Prompt IA               | 2/5   | 4/5   | Seuils stricts info/warning/danger, interdictions explicites        |
| Tests                   | 4/5   | 4/5   | Tests Python couvrent les cas de base                               |

**Score global : 4.3 / 5** ⭐ _(avant : 2.8/5)_

---

## 7. Corrections appliquées

| ID         | Issue                                       | Correction                                                                        | Fichier(s)                           |
| ---------- | ------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| L1.1       | Route `GET` pour effet de bord              | `Route::post('analysis', ...)`                                                    | `routes/api.php`                     |
| L1.2       | Faille IDOR                                 | `analyze()` utilise `$request->user()` uniquement (self-only)                     | `StudentAnalysisController.php`      |
| L1.3       | Notification jamais dispatchée              | `$student->notify(new StudentAnalysisNotification($analysis))`                    | `StudentAnalysisController.php`      |
| L1.4       | Pas de validation retour Python             | Vérification `$analysisData`, `$contextData`, champs requis → 502 si invalide     | `StudentAnalysisController.php`      |
| L1.5       | `$e->getMessage()` exposé                   | Supprimé du JSON de réponse, log seulement                                        | `StudentAnalysisController.php`      |
| L1.6       | `markAsSent` ambiguïté + IDOR               | `WHERE id = $id AND user_id = auth()->id()`                                       | `StudentAnalysisController.php`      |
| L2.1       | `internal_key` inutilisée                   | ⏭️ Ignoré (voulu par l'utilisateur — auth par token Sanctum)                      | —                                    |
| L3.1       | Pas de scopes                               | Ajout `scopeForUser()`, `scopeRecent()`                                           | `StudentAnalysis.php`                |
| P1.1       | Double router                               | Supprimé le doublon `include_router`                                              | `main.py`                            |
| P2.1       | Pas de `response_model`                     | Ajout `response_model=StudentAnalysisResponse`                                    | `analysis_routes.py`                 |
| P2.2       | Pas de contrôle d'autorisation              | Check `current_user.id != student_id` pour rôle student → 403                     | `analysis_routes.py`                 |
| P2.3       | Exception exposée                           | Log serveur + message générique au client                                         | `analysis_routes.py`                 |
| P3.1       | Pool DB créé/fermé à chaque appel           | Utilise `get_db_pool()` singleton de `dependencies.py`                            | `student_analyzer.py`                |
| P3.2       | `json.loads` sans try/except                | `try/except JSONDecodeError` → `ValueError` explicite                             | `student_analyzer.py`                |
| P3.3       | Nettoyage backticks fragile                 | Boucle sur parties + fallback regex `\{[\s\S]*\}`                                 | `student_analyzer.py`                |
| P3.4       | JSON LLM non validé                         | Validation via `AnalysisResult(**analysis)` avec `field_validator`                | `student_analyzer.py` + `schemas.py` |
| P3.5       | Données sensibles au LLM                    | ⏭️ Ignoré (voulu par l'utilisateur)                                               | —                                    |
| **PROMPT** | LLM ne distingue pas bons/mauvais résultats | Seuils stricts danger/warning/info + interdictions explicites + exemples concrets | `student_analyzer.py`                |
| F1.1       | Pas d'AbortController                       | `mountedRef` empêche set state après démontage                                    | `StudentAnalysis.jsx`                |
| F1.2       | Pas de gestion 429                          | Si 429 + data → affiche l'analyse existante avec toast horloge                    | `StudentAnalysis.jsx`                |
| F1.3       | Composant n'utilise pas studentService      | Remplacé `laravelApiClient` par `studentService`                                  | `StudentAnalysis.jsx`                |

---

## 8. Plan de correction initial (référence)

### Priorité 1 — Critiques

1. **L1.1** : Changer `Route::get('analysis')` → `Route::post('analysis')` + adapter le frontend
2. **L1.2** : Ajouter contrôle `$targetId === $request->user()->id` (sauf admin/chef)
3. **L1.3** : Dispatcher `StudentAnalysisNotification` après le `create()`
4. **P1.1** : Supprimer la ligne dupliquée dans `main.py`

### Priorité 2 — Importants

5. **L1.4** : Valider la structure du retour Python avant de l'utiliser
6. **L1.5** : Ne pas exposer `$e->getMessage()` en production
7. **L1.6** : Sécuriser `markAsSent` (autorisation) + résoudre l'ambiguïté ID
8. **L2.1** : Envoyer l'`internal_key` en header ou la supprimer
9. **P2.1** : Ajouter `response_model=StudentAnalysisResponse` à la route
10. **P3.1** : Utiliser le singleton `get_db_pool()` de `dependencies.py`
11. **P3.2** : Entourer `json.loads()` d'un try/except JSONDecodeError
12. **P3.4** : Valider le JSON LLM avec le schema Pydantic `AnalysisResult`
13. **F1.1** : Ajouter AbortController au composant
14. **F1.4** : Intégrer `markAnalysisAsSent` dans l'UI ou supprimer

### Priorité 3 — Mineurs

15. Gérer le 429 côté frontend pour afficher l'analyse existante
16. Utiliser `studentService.js` au lieu d'appeler `laravelApiClient` directement
17. Améliorer le nettoyage backticks LLM
18. Ajouter retry au `PythonAIService`
19. Ajouter scopes au modèle `StudentAnalysis`
