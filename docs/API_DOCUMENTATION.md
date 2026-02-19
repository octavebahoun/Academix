# 📚 Documentation API — Hackaton IFRI 2026

> **Base URL :** `http://localhost:8000/api/v1`
> **Authentification :** Bearer Token (Laravel Sanctum)
> **Format :** JSON (sauf imports CSV en `multipart/form-data`)

---

## Table des matières

1. [Authentification](#1-authentification)
2. [Admin — Départements](#2-admin--départements)
3. [Admin — Chefs de Département](#3-admin--chefs-de-département)
4. [Admin — Filières](#4-admin--filières)
5. [Admin — Matières](#5-admin--matières)
6. [Admin — Import CSV](#6-admin--import-csv)
7. [Admin — Emploi du temps](#7-admin--emploi-du-temps)
8. [Admin — Statistiques](#8-admin--statistiques)
9. [Étudiant — Profil](#9-étudiant--profil)
10. [Étudiant — Notes & Moyennes](#10-étudiant--notes--moyennes)
11. [Étudiant — Tâches](#11-étudiant--tâches)
12. [Étudiant — Alertes](#12-étudiant--alertes)
13. [Modèles de données](#13-modèles-de-données)
14. [Codes d'erreur](#14-codes-derreur)

---

## Authentification

Tous les endpoints protégés nécessitent le header :

```
Authorization: Bearer {token}
```

Les tokens sont obtenus via les endpoints de login et sont de type **Sanctum**.

---

## 1. Authentification

### 1.1 Connexion Admin

**`POST /auth/admin/login`**

Connexion pour les comptes `super_admin` ou `chef_departement`.

**Accès :** Public

**Body :**

```json
{
  "email": "admin@ifri.bj",
  "password": "motdepasse123"
}
```

| Champ      | Type           | Requis | Description      |
| ---------- | -------------- | ------ | ---------------- |
| `email`    | string (email) | ✅     | Email de l'admin |
| `password` | string         | ✅     | Mot de passe     |

**Réponse succès `200 OK` :**

```json
{
  "token": "1|xxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "admin": {
    "id": 1,
    "nom": "ADMIN",
    "prenom": "Super",
    "role": "super_admin",
    "departement": { "id": 1, "nom": "Informatique" }
  }
}
```

**Erreurs :**
| Code | Message | Cause |
|------|---------|-------|
| `401` | `Identifiants incorrects` | Email ou mot de passe invalide |
| `403` | `Compte désactivé` | Le compte admin est inactif |

**Exemple cURL :**

```bash
curl -X POST http://localhost:8000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ifri.bj", "password": "motdepasse123"}'
```

---

### 1.2 Déconnexion Admin

**`POST /auth/admin/logout`**

**Accès :** Admin authentifié (`auth:sanctum`)

**Réponse `200 OK` :**

```json
{ "message": "Déconnecté avec succès" }
```

---

### 1.3 Inscription Étudiant

**`POST /auth/student/register`**

Activation du compte étudiant (le matricule doit exister suite à un import CSV).

**Accès :** Public

**Body :**

```json
{
  "matricule": "ETU2025001",
  "email": "etudiant@example.com",
  "password": "motdepasse1234",
  "password_confirmation": "motdepasse1234",
  "telephone": "+22901234567"
}
```

| Champ                   | Type           | Requis | Description                              |
| ----------------------- | -------------- | ------ | ---------------------------------------- |
| `matricule`             | string         | ✅     | Matricule existant (importé par l'admin) |
| `email`                 | string (email) | ✅     | Email unique                             |
| `password`              | string (min:8) | ✅     | Mot de passe                             |
| `password_confirmation` | string         | ✅     | Confirmation du mot de passe             |
| `telephone`             | string         | ❌     | Numéro de téléphone                      |

**Flux :** L'admin importe les étudiants via CSV (avec matricule, nom, prénom, filière). L'étudiant complète ensuite son compte avec email + password.

**Réponse succès `201 Created` :**

```json
{
  "token": "2|xxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 5,
    "matricule": "ETU2025001",
    "nom": "DUPONT",
    "prenom": "Jean",
    "filiere": { "id": 1, "nom": "Informatique L1", "niveau": "L1" }
  }
}
```

**Erreurs :**
| Code | Message | Cause |
|------|---------|-------|
| `422` | `Matricule inconnu` | Le matricule n'existe pas dans la base |
| `409` | `Compte déjà activé` | L'étudiant a déjà un email enregistré |

---

### 1.4 Connexion Étudiant

**`POST /auth/student/login`**

**Accès :** Public

**Body :**

```json
{
  "email": "etudiant@example.com",
  "password": "motdepasse1234"
}
```

**Réponse succès `200 OK` :**

```json
{
  "token": "2|xxxxxxxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 5,
    "matricule": "ETU2025001",
    "nom": "DUPONT",
    "prenom": "Jean",
    "filiere": { "id": 1, "nom": "Informatique L1" }
  }
}
```

---

### 1.5 Déconnexion Étudiant

**`POST /auth/student/logout`**

**Accès :** Étudiant authentifié

**Réponse `200 OK` :** `{ "message": "Déconnecté avec succès" }`

---

### 1.6 Profil de l'utilisateur connecté

**`GET /auth/me`**

**Accès :** Tout utilisateur authentifié (admin ou étudiant)

**Réponse `200 OK` :**

_Si admin :_

```json
{
  "type": "admin",
  "profil": {
    "id": 1,
    "nom": "ADMIN",
    "role": "super_admin",
    "departement": { "id": 1, "nom": "Informatique" }
  }
}
```

_Si étudiant :_

```json
{
  "type": "student",
  "profil": {
    "id": 5, "matricule": "ETU001", "nom": "DUPONT",
    "filiere": { "id": 1, "niveau": "L1", "departement": {...} }
  }
}
```

---

## 2. Admin — Départements

> **Accès requis :** `super_admin` uniquement

### 2.1 Liste des départements

**`GET /admin/departements`**

**Query params optionnels :**
| Paramètre | Type | Description |
|-----------|------|-------------|
| `search` | string | Filtrer par nom ou code (LIKE) |

**Réponse `200 OK` :**

```json
[
  {
    "id": 1,
    "nom": "Informatique",
    "code": "INFO",
    "description": "Département d'informatique",
    "filieres_count": 4,
    "admins_count": 2
  }
]
```

---

### 2.2 Créer un département

**`POST /admin/departements`**

**Body :**

```json
{
  "nom": "Génie Civil",
  "code": "GC",
  "description": "Département de génie civil"
}
```

| Champ         | Type   | Requis | Contraintes    |
| ------------- | ------ | ------ | -------------- |
| `nom`         | string | ✅     | max:100        |
| `code`        | string | ✅     | max:10, unique |
| `description` | string | ❌     | —              |

**Réponse `201 Created` :** Département créé.

---

### 2.3 Détails d'un département

**`GET /admin/departements/{id}`**

**Réponse `200 OK` :**

```json
{
  "id": 1,
  "nom": "Informatique",
  "code": "INFO",
  "filieres": [...],
  "admins": [
    { "id": 2, "nom": "CHEF", "role": "chef_departement", "is_active": true }
  ]
}
```

**Erreurs :** `404` si département inexistant.

---

### 2.4 Modifier un département

**`PUT /admin/departements/{id}`**

**Body (champs optionnels) :**

```json
{
  "nom": "Informatique et Numérique",
  "code": "INFO2",
  "description": "Nouvelle description"
}
```

> ⚠️ Pour l'unicité du code, le code actuel du département est automatiquement ignoré lors de la validation.

---

### 2.5 Supprimer un département

**`DELETE /admin/departements/{id}`**

> ⚠️ Bloqué si des filières actives sont encore liées au département.

**Réponse `204 No Content`** en cas de succès.

**Erreur :**
| Code | Message | Cause |
|------|---------|-------|
| `409` | `Impossible de supprimer : ce département contient des filières actives.` | Filières encore liées |

---

### 2.6 Statistiques d'un département

**`GET /admin/departements/{id}/stats`**

**Réponse `200 OK` :**

```json
{
  "total_filieres": 4,
  "total_etudiants": 120,
  "moyenne_generale": 12.5,
  "taux_reussite": 68.5,
  "filieres": [
    {
      "nom": "L1 Informatique",
      "niveau": "L1",
      "nb_etudiants": 45,
      "moyenne": 13.2,
      "taux": 72.0
    }
  ]
}
```

---

## 3. Admin — Chefs de Département

> **Accès requis :** `super_admin` uniquement

### 3.1 Liste des chefs de département

**`GET /admin/chefs-departement`**

**Réponse `200 OK` :**

```json
[
  {
    "id": 2,
    "nom": "MARTIN",
    "prenom": "Claude",
    "email": "martin@ifri.bj",
    "role": "chef_departement",
    "is_active": true,
    "departement": { "id": 1, "nom": "Informatique" }
  }
]
```

---

### 3.2 Créer un chef de département

**`POST /admin/chefs-departement`**

**Body :**

```json
{
  "nom": "MARTIN",
  "prenom": "Claude",
  "email": "martin@ifri.bj",
  "password": "motdepasse123",
  "telephone": "+22901234567",
  "departement_id": 1
}
```

| Champ            | Type           | Requis | Contraintes         |
| ---------------- | -------------- | ------ | ------------------- |
| `nom`            | string         | ✅     | max:100             |
| `prenom`         | string         | ✅     | max:100             |
| `email`          | string (email) | ✅     | unique:admins       |
| `password`       | string         | ✅     | min:8               |
| `telephone`      | string         | ❌     | max:20              |
| `departement_id` | integer        | ✅     | exists:departements |

**Réponse `201 Created`** avec le chef et son département.

**Erreur :** `409` si un chef actif existe déjà pour ce département.

---

### 3.3 Détails d'un chef

**`GET /admin/chefs-departement/{id}`**

**Réponse :** Chef + département + 10 derniers imports.

---

### 3.4 Modifier un chef

**`PUT /admin/chefs-departement/{id}`**

Tous les champs sont optionnels. Si `password` est fourni, il sera hashé.

---

### 3.5 Supprimer un chef

**`DELETE /admin/chefs-departement/{id}`**

> ⚠️ Bloqué si un import est en cours. Préférer l'action `toggle` pour désactiver.

**Réponse `204 No Content`**

---

### 3.6 Activer / Désactiver un chef

**`POST /admin/chefs-departement/{id}/toggle`**

Inverse le statut `is_active` du chef. Si désactivé → tous ses tokens Sanctum sont révoqués.

**Réponse `200 OK` :**

```json
{
  "message": "Compte désactivé",
  "is_active": false
}
```

---

## 4. Admin — Filières

> **Accès requis :** Admin authentifié (super_admin voit tout, chef_departement voit les siennes)

### 4.1 Liste des filières

**`GET /admin/filieres`**

**Query params optionnels :**
| Paramètre | Description |
|-----------|-------------|
| `niveau` | Filtrer par niveau (`L1`, `L2`, `L3`, `M1`, `M2`) |
| `annee_academique` | Filtrer par année (ex: `2025-2026`) |

**Réponse `200 OK` :**

```json
[
  {
    "id": 1,
    "nom": "Licence 1 Informatique",
    "code": "L1-INFO-2026",
    "niveau": "L1",
    "annee_academique": "2025-2026",
    "users_count": 45,
    "departement": { "id": 1, "nom": "Informatique" }
  }
]
```

---

### 4.2 Créer une filière

**`POST /admin/filieres`**

**Body :**

```json
{
  "departement_id": 1,
  "nom": "Licence 1 Informatique",
  "niveau": "L1",
  "code": "L1-INFO-2026",
  "annee_academique": "2025-2026",
  "description": "Première année de licence en informatique"
}
```

| Champ              | Type    | Requis | Contraintes              |
| ------------------ | ------- | ------ | ------------------------ |
| `departement_id`   | integer | ✅     | exists:departements      |
| `nom`              | string  | ✅     | max:100                  |
| `niveau`           | string  | ✅     | in:`L1,L2,L3,M1,M2`      |
| `code`             | string  | ✅     | max:20, unique           |
| `annee_academique` | string  | ✅     | max:20 (ex: `2025-2026`) |
| `description`      | string  | ❌     | —                        |

> ⚠️ Un chef de département ne peut créer des filières que dans **son** département.

---

### 4.3 Détails d'une filière

**`GET /admin/filieres/{id}`**

**Réponse :** Filière + département + matières + compteur étudiants.

---

### 4.4 Modifier une filière

**`PUT /admin/filieres/{id}`**

Tous les champs sont optionnels (`sometimes`). Le `departement_id` ne peut **PAS** être changé via cet endpoint.

---

### 4.5 Supprimer une filière

**`DELETE /admin/filieres/{id}`**

> ⚠️ Bloqué si des étudiants sont encore inscrits dans cette filière.

---

### 4.6 Étudiants d'une filière

**`GET /admin/filieres/{id}/etudiants`**

**Query params optionnels :**
| Paramètre | Description |
|-----------|-------------|
| `search` | Filtrer par nom, prénom ou matricule |
| `is_active` | `1` = actifs seulement, `0` = inactifs |

**Réponse `200 OK` (paginée, 20 par page) :**

```json
{
  "data": [
    {
      "id": 5,
      "matricule": "ETU001",
      "nom": "DUPONT",
      "prenom": "Jean",
      "email": "jean@ifri.bj",
      "is_active": true,
      "annee_admission": 2025
    }
  ],
  "current_page": 1,
  "total": 45
}
```

---

### 4.7 Statistiques d'une filière

**`GET /admin/filieres/{id}/stats`**

Voir section [8.3 Statistiques d'une filière](#83-statistiques-dune-filière) pour le format de réponse.

---

## 5. Admin — Matières

> **Accès requis :** Admin authentifié

### 5.1 Liste des matières

**`GET /admin/matieres`**

**Query params :** `?search=algo` — Filtrer par nom ou code.

**Réponse `200 OK` :**

```json
[
  {
    "id": 1,
    "nom": "Algorithmique",
    "code": "ALGO101",
    "coefficient": 3,
    "enseignant": "Dr. AKANDE",
    "filieres_count": 2
  }
]
```

---

### 5.2 Créer une matière

**`POST /admin/matieres`**

**Body :**

```json
{
  "nom": "Algorithmique",
  "code": "ALGO101",
  "coefficient": 3,
  "description": "Introduction aux algorithmes",
  "enseignant": "Dr. AKANDE"
}
```

| Champ         | Type    | Requis | Contraintes             |
| ------------- | ------- | ------ | ----------------------- |
| `nom`         | string  | ✅     | max:100                 |
| `code`        | string  | ✅     | max:20, unique          |
| `coefficient` | integer | ❌     | min:1, max:10, défaut:1 |
| `description` | string  | ❌     | —                       |
| `enseignant`  | string  | ❌     | max:100                 |

> La matière est créée dans un **pool global**, puis assignée à des filières via [5.5 Assigner à une filière](#55-assigner-une-matière-à-une-filière).

---

### 5.3 Modifier une matière

**`PUT /admin/matieres/{id}`**

Tous les champs sont optionnels.

---

### 5.4 Supprimer une matière

**`DELETE /admin/matieres/{id}`**

> ⚠️ Bloqué si des notes existent pour cette matière.

---

### 5.5 Assigner une matière à une filière

**`POST /admin/filieres/{filiereId}/matieres`**

**Body :**

```json
{
  "matiere_id": 1,
  "semestre": "S1"
}
```

| Champ        | Type    | Requis | Valeurs         |
| ------------ | ------- | ------ | --------------- |
| `matiere_id` | integer | ✅     | exists:matieres |
| `semestre`   | string  | ✅     | `S1` ou `S2`    |

**Réponse `201 Created` :** `{ "message": "Matière assignée avec succès", "semestre": "S1" }`

**Erreur `409`** si la matière est déjà assignée à cette filière.

---

### 5.6 Retirer une matière d'une filière

**`DELETE /admin/filieres/{filiereId}/matieres/{matiereId}`**

> ⚠️ Bloqué si des notes existent pour des étudiants de cette filière dans cette matière.

**Réponse `204 No Content`**

---

## 6. Admin — Import CSV

> **Accès requis :** Admin authentifié
> **Content-Type :** `multipart/form-data`

### 6.1 Importer des étudiants

**`POST /admin/import/etudiants`**

**Champ :** `file` (CSV, max 5MB)

**Format CSV requis :**

```csv
matricule,nom,prenom,filiere_code,annee_admission
ETU001,DUPONT,Jean,L1-INFO-2026,2025
ETU002,MARTIN,Marie,L1-INFO-2026,2025
```

**Réponse `200 OK` :**

```json
{
  "import_id": 5,
  "total": 100,
  "valides": 98,
  "erreurs": 2,
  "erreurs_details": [
    { "ligne": 3, "raison": "Filière introuvable: L1-GC-XXX" },
    { "ligne": 7, "raison": "Matricule déjà existant" }
  ]
}
```

---

### 6.2 Importer des notes

**`POST /admin/import/notes`**

**Champ :** `file` (CSV, max 5MB)

**Format CSV requis :**

```csv
matricule,matiere_code,note,note_max,type_evaluation,coefficient,date_evaluation,semestre,annee_academique
ETU001,ALGO101,14.5,20,Devoir,2,2025-11-15,S1,2025-2026
```

| Colonne           | Valeurs possibles                             |
| ----------------- | --------------------------------------------- |
| `type_evaluation` | `Devoir`, `Partiel`, `TP`, `Projet`, `Examen` |
| `semestre`        | `S1`, `S2`                                    |

---

### 6.3 Historique des imports

**`GET /admin/import/history`**

**Comportement :** super_admin voit tous les imports, chef_departement voit seulement les siens.

**Réponse `200 OK` (paginée, 15 par page) :**

```json
{
  "data": [
    {
      "id": 5,
      "type_import": "etudiants",
      "fichier_nom": "etudiants_nov2025.csv",
      "total_lignes": 100,
      "lignes_valides": 98,
      "lignes_erreur": 2,
      "statut": "termine",
      "completed_at": "2025-11-15T10:30:00Z",
      "admin": { "id": 2, "nom": "MARTIN", "prenom": "Claude" }
    }
  ]
}
```

---

### 6.4 Détails d'un import

**`GET /admin/import/{id}`**

**Erreurs :** `403` si chef tente de voir un import qui n'est pas le sien.

---

### 6.5 Template CSV Étudiants

**`GET /admin/import/template/etudiants`**

Télécharge un fichier CSV vide avec les colonnes correctes et une ligne exemple.

**Réponse :** Fichier `template_etudiants.csv` en téléchargement.

---

### 6.6 Template CSV Notes

**`GET /admin/import/template/notes`**

Télécharge le template CSV pour l'import de notes.

**Réponse :** Fichier `template_notes.csv` en téléchargement.

---

## 7. Admin — Emploi du temps

> **Accès requis :** Admin authentifié

### 7.1 Emploi du temps d'une filière

**`GET /admin/emploi-temps/filieres/{id}`**

**Query params :**
| Paramètre | Description |
|-----------|-------------|
| `semestre` | `S1` ou `S2` |
| `jour` | `Lundi`, `Mardi`, `Mercredi`, `Jeudi`, `Vendredi`, `Samedi` |

**Réponse `200 OK` :**

```json
[
  {
    "id": 1,
    "jour": "Lundi",
    "heure_debut": "08:00",
    "heure_fin": "10:00",
    "matiere": { "nom": "Algorithmique", "code": "ALGO101" },
    "salle": "B201",
    "type_cours": "CM",
    "enseignant": "Dr. AKANDE",
    "semestre": "S1"
  }
]
```

---

### 7.2 Ajouter un cours

**`POST /admin/emploi-temps`**

**Body :**

```json
{
  "filiere_id": 1,
  "matiere_id": 1,
  "jour": "Lundi",
  "heure_debut": "08:00",
  "heure_fin": "10:00",
  "salle": "B201",
  "type_cours": "CM",
  "enseignant": "Dr. AKANDE",
  "semestre": "S1"
}
```

| Champ         | Type    | Requis | Contraintes                                 |
| ------------- | ------- | ------ | ------------------------------------------- |
| `filiere_id`  | integer | ✅     | exists:filieres                             |
| `matiere_id`  | integer | ✅     | exists:matieres (doit être dans la filière) |
| `jour`        | string  | ✅     | `Lundi` à `Samedi`                          |
| `heure_debut` | string  | ✅     | Format `H:i` (ex: `08:00`)                  |
| `heure_fin`   | string  | ✅     | Format `H:i`, après `heure_debut`           |
| `salle`       | string  | ❌     | max:50                                      |
| `type_cours`  | string  | ✅     | `CM`, `TD` ou `TP`                          |
| `enseignant`  | string  | ❌     | max:100                                     |
| `semestre`    | string  | ✅     | `S1` ou `S2`                                |

**Validations métier :**

- La matière doit appartenir à la filière
- Vérification de conflit de salle (même salle, même jour, horaires qui se chevauchent)

**Erreurs :**
| Code | Cause |
|------|-------|
| `422` | Matière non liée à la filière |
| `409` | Conflit de salle détecté |

---

### 7.3 Modifier un cours

**`PUT /admin/emploi-temps/{id}`**

Tous les champs sont optionnels. `filiere_id` ne peut **PAS** être changé.

---

### 7.4 Supprimer un cours

**`DELETE /admin/emploi-temps/{id}`**

**Réponse `204 No Content`**

---

## 8. Admin — Statistiques

> **Accès requis :** Admin authentifié (accès partiel selon rôle)

### 8.1 Statistiques globales

**`GET /admin/stats/global`**

**Accès :** `super_admin` uniquement

**Réponse `200 OK` :**

```json
{
  "total_departements": 4,
  "total_filieres": 12,
  "total_etudiants": 350,
  "moyenne_generale": 12.45,
  "taux_reussite": 68.5,
  "departements": [
    {
      "id": 1,
      "nom": "Informatique",
      "total_filieres": 4,
      "total_etudiants": 120,
      "moyenne": 13.2
    }
  ]
}
```

---

### 8.2 Statistiques d'un département

**`GET /admin/stats/departement/{id}`**

**Accès :** super_admin (tous), chef_departement (son département uniquement → sinon `403`)

**Réponse `200 OK` :**

```json
{
  "departement": { "nom": "Informatique", "code": "INFO" },
  "total_filieres": 4,
  "total_etudiants": 120,
  "moyenne_generale": 12.5,
  "taux_reussite": 68.5,
  "filieres": [
    {
      "nom": "L1 Informatique",
      "niveau": "L1",
      "nb_etudiants": 45,
      "moyenne": 13.2,
      "taux_reussite": 72.0
    }
  ]
}
```

---

### 8.3 Statistiques d'une filière

**`GET /admin/stats/filiere/{id}`**

**Réponse `200 OK` :**

```json
{
  "filiere": {
    "nom": "L1 Informatique",
    "niveau": "L1",
    "code": "L1-INFO-2026"
  },
  "total_etudiants": 45,
  "moyenne_s1": 12.8,
  "moyenne_s2": 13.1,
  "taux_reussite_s1": 70.0,
  "taux_reussite_s2": 75.0,
  "matieres": [
    {
      "nom": "Algorithmique",
      "code": "ALGO101",
      "coefficient": 3,
      "moyenne_s1": 13.5,
      "moyenne_s2": null,
      "note_min": 4.0,
      "note_max": 20.0,
      "taux_reussite": 78.0
    }
  ]
}
```

---

### 8.4 Dashboard personnalisé

**`GET /admin/stats/dashboard`**

**Accès :** Tout admin authentifié

**Réponse selon rôle :**

_Super Admin :_

```json
{
  "total_departements": 4,
  "total_filieres": 12,
  "total_etudiants": 350,
  "derniers_imports": [...],
  "top_departements": [...]
}
```

_Chef de Département :_

```json
{
  "departement": { "nom": "Informatique", "filieres": [...] },
  "etudiants_difficulte": [...],
  "derniers_imports": [...]
}
```

---

## 9. Étudiant — Profil

> **Accès requis :** Étudiant authentifié

### 9.1 Voir son profil

**`GET /student/profil`**

**Réponse `200 OK` :**

```json
{
  "id": 5,
  "matricule": "ETU001",
  "nom": "DUPONT",
  "prenom": "Jean",
  "email": "jean@ifri.bj",
  "telephone": "+22901234567",
  "photo": "https://...",
  "annee_admission": 2025,
  "objectif_moyenne": 14.0,
  "style_apprentissage": "visuel",
  "last_login": "2025-11-20T08:00:00Z",
  "filiere": {
    "id": 1,
    "nom": "L1 Informatique",
    "niveau": "L1",
    "annee_academique": "2025-2026",
    "departement": { "nom": "Informatique" }
  }
}
```

> Les champs `password` et `remember_token` ne sont **jamais** exposés.

---

### 9.2 Mettre à jour son profil

**`PUT /student/profil`**

**Body (tous optionnels) :**

```json
{
  "telephone": "+22907654321",
  "photo": "https://cdn.example.com/photo.jpg",
  "objectif_moyenne": 15.0,
  "style_apprentissage": "visuel"
}
```

| Champ                 | Type         | Requis | Contraintes                          |
| --------------------- | ------------ | ------ | ------------------------------------ |
| `telephone`           | string       | ❌     | max:20                               |
| `photo`               | string (url) | ❌     | URL valide                           |
| `objectif_moyenne`    | numeric      | ❌     | min:0, max:20                        |
| `style_apprentissage` | string       | ❌     | `visuel`, `auditif`, `kinesthesique` |

> ⚠️ L'étudiant **ne peut pas** modifier : `matricule`, `nom`, `prenom`, `email`, `filiere_id`.

---

## 10. Étudiant — Notes & Moyennes

### 10.1 Mes notes

**`GET /student/notes`**

**Query params :**
| Paramètre | Description |
|-----------|-------------|
| `semestre` | `S1` ou `S2` |
| `annee_academique` | ex: `2025-2026` |

**Réponse `200 OK` :**

```json
[
  {
    "id": 1,
    "note": 14.5,
    "note_max": 20,
    "coefficient": 2,
    "type_evaluation": "Devoir",
    "date_evaluation": "2025-11-15",
    "semestre": "S1",
    "annee_academique": "2025-2026",
    "matiere": {
      "id": 1,
      "nom": "Algorithmique",
      "code": "ALGO101",
      "coefficient": 3
    }
  }
]
```

---

### 10.2 Mes moyennes calculées

**`GET /student/moyennes`**

**Réponse `200 OK` :**

```json
{
  "semestres": {
    "S1": {
      "moyenne": 13.5,
      "matieres": [
        {
          "matiere_nom": "Algorithmique",
          "coefficient": 3,
          "semestre": "S1",
          "moyenne_ponderee": 14.0
        }
      ]
    },
    "S2": {
      "moyenne": 12.0,
      "matieres": [...]
    }
  },
  "moyenne_generale": 12.75,
  "objectif_moyenne": 14.0,
  "ecart_objectif": -1.25
}
```

**Formule :** Σ(note × coefficient) / Σ(coefficient)

---

### 10.3 Mon emploi du temps

**`GET /student/emploi-temps`**

**Query params :** `?semestre=S1`, `?jour=Lundi`

**Réponse :** Liste des cours triés par jour (Lundi → Samedi) et heure de début.

---

### 10.4 Mes matières

**`GET /student/matieres`**

**Réponse :**

```json
[
  {
    "id": 1,
    "nom": "Algorithmique",
    "code": "ALGO101",
    "coefficient": 3,
    "enseignant": "Dr. AKANDE",
    "pivot": { "semestre": "S1" }
  }
]
```

---

## 11. Étudiant — Tâches

### 11.1 Liste de mes tâches

**`GET /student/taches`**

**Query params :**
| Paramètre | Valeurs |
|-----------|---------|
| `statut` | `a_faire`, `en_cours`, `terminee` |
| `priorite` | `basse`, `moyenne`, `haute` |
| `matiere_id` | integer |

**Réponse `200 OK` :**

```json
[
  {
    "id": 1,
    "titre": "Réviser le chapitre 3",
    "description": "Arbres binaires...",
    "date_limite": "2025-11-20T23:59:00Z",
    "priorite": "haute",
    "statut": "a_faire",
    "matiere": { "id": 1, "nom": "Algorithmique", "code": "ALGO101" }
  }
]
```

---

### 11.2 Créer une tâche

**`POST /student/taches`**

**Body :**

```json
{
  "titre": "Réviser le chapitre 3",
  "description": "Revoir les arbres binaires",
  "matiere_id": 1,
  "date_limite": "2025-11-20T23:59:00Z",
  "priorite": "haute"
}
```

| Champ         | Type     | Requis | Contraintes                          |
| ------------- | -------- | ------ | ------------------------------------ |
| `titre`       | string   | ✅     | max:255                              |
| `description` | string   | ❌     | —                                    |
| `matiere_id`  | integer  | ❌     | exists:matieres                      |
| `date_limite` | datetime | ✅     | Doit être dans le futur              |
| `priorite`    | string   | ❌     | `basse`, `moyenne` (défaut), `haute` |

> Le `statut` est automatiquement initialisé à `a_faire`.

**Réponse `201 Created`**

---

### 11.3 Modifier une tâche

**`PUT /student/taches/{id}`**

Tous les champs sont optionnels. L'étudiant ne peut modifier que ses propres tâches (`403` sinon).

---

### 11.4 Supprimer une tâche

**`DELETE /student/taches/{id}`**

**Réponse `204 No Content`**

> ⚠️ Suppression définitive (pas de soft delete).

---

### 11.5 Marquer comme terminée

**`PATCH /student/taches/{id}/complete`**

Action rapide sans body. Met le statut à `terminee`.

**Réponse `200 OK` :**

```json
{
  "message": "Tâche marquée comme terminée",
  "tache": { "id": 1, "titre": "Réviser...", "statut": "terminee" }
}
```

---

## 12. Étudiant — Alertes

### 12.1 Mes alertes

**`GET /student/alertes`**

**Query params :**
| Paramètre | Description |
|-----------|-------------|
| `lues` | `0` = non lues seulement, `1` = lues seulement |
| `type` | `moyenne_faible`, `deadline_proche`, `note_faible`, `absence` |

**Réponse `200 OK` :**

```json
{
  "total": 5,
  "non_lues": 3,
  "alertes": [
    {
      "id": 12,
      "type_alerte": "moyenne_faible",
      "niveau_severite": "eleve",
      "titre": "Attention : votre moyenne chute !",
      "message": "Votre moyenne en Algorithmique est de 7.5/20",
      "actions_suggerees": ["Revoir le cours", "Consulter le prof"],
      "est_lue": false,
      "created_at": "2025-11-15T10:30:00Z"
    }
  ]
}
```

---

### 12.2 Marquer une alerte comme lue

**`PATCH /student/alertes/{id}/read`**

Opération **idempotente** : si déjà lue, retourne `200` sans erreur.

> ⚠️ Vérification que l'alerte appartient à l'étudiant (`403` sinon).

**Réponse `200 OK` :**

```json
{
  "message": "Alerte marquée comme lue",
  "alerte": { "id": 12, "est_lue": true, ... }
}
```

---

## 13. Modèles de données

### User (Étudiant)

| Champ                 | Type     | Description                          |
| --------------------- | -------- | ------------------------------------ |
| `id`                  | integer  | Identifiant unique                   |
| `matricule`           | string   | Identifiant académique unique        |
| `nom`                 | string   | Nom de famille                       |
| `prenom`              | string   | Prénom                               |
| `email`               | string   | Email (null avant activation)        |
| `telephone`           | string   | Numéro de téléphone                  |
| `filiere_id`          | integer  | FK → Filiere                         |
| `annee_admission`     | integer  | Année d'entrée                       |
| `objectif_moyenne`    | decimal  | Objectif personnel sur 20            |
| `style_apprentissage` | enum     | `visuel`, `auditif`, `kinesthesique` |
| `is_active`           | boolean  | Compte activé (set lors du register) |
| `last_login`          | datetime | Dernière connexion                   |

### Admin

| Champ            | Type     | Description                            |
| ---------------- | -------- | -------------------------------------- |
| `id`             | integer  | Identifiant unique                     |
| `nom`, `prenom`  | string   | Identité                               |
| `email`          | string   | Email unique                           |
| `role`           | enum     | `super_admin`, `chef_departement`      |
| `departement_id` | integer  | FK → Departement (null si super_admin) |
| `is_active`      | boolean  | Statut du compte                       |
| `last_login`     | datetime | Dernière connexion                     |

### Departement

| Champ         | Type    | Description          |
| ------------- | ------- | -------------------- |
| `id`          | integer | —                    |
| `nom`         | string  | Nom du département   |
| `code`        | string  | Code unique (max:10) |
| `description` | string  | Description          |

### Filiere

| Champ              | Type    | Description                      |
| ------------------ | ------- | -------------------------------- |
| `id`               | integer | —                                |
| `departement_id`   | integer | FK → Departement                 |
| `nom`              | string  | Nom de la filière                |
| `code`             | string  | Code unique (ex: `L1-INFO-2026`) |
| `niveau`           | enum    | `L1`, `L2`, `L3`, `M1`, `M2`     |
| `annee_academique` | string  | ex: `2025-2026`                  |

### Matiere

| Champ         | Type    | Description                 |
| ------------- | ------- | --------------------------- |
| `id`          | integer | —                           |
| `nom`         | string  | Nom de la matière           |
| `code`        | string  | Code unique (ex: `ALGO101`) |
| `coefficient` | integer | De 1 à 10                   |
| `enseignant`  | string  | Nom de l'enseignant         |

### Tache

| Champ         | Type     | Description                       |
| ------------- | -------- | --------------------------------- |
| `id`          | integer  | —                                 |
| `user_id`     | integer  | FK → User                         |
| `matiere_id`  | integer  | FK → Matiere (nullable)           |
| `titre`       | string   | Titre de la tâche                 |
| `description` | string   | Description                       |
| `date_limite` | datetime | Échéance                          |
| `priorite`    | enum     | `basse`, `moyenne`, `haute`       |
| `statut`      | enum     | `a_faire`, `en_cours`, `terminee` |

### Alerte

| Champ               | Type       | Description                                                   |
| ------------------- | ---------- | ------------------------------------------------------------- |
| `id`                | integer    | —                                                             |
| `user_id`           | integer    | FK → User                                                     |
| `type_alerte`       | enum       | `moyenne_faible`, `deadline_proche`, `note_faible`, `absence` |
| `niveau_severite`   | string     | `faible`, `moyen`, `eleve`                                    |
| `titre`             | string     | Titre de l'alerte                                             |
| `message`           | string     | Corps du message                                              |
| `actions_suggerees` | JSON array | Liste d'actions recommandées                                  |
| `est_lue`           | boolean    | Statut de lecture                                             |

---

## 14. Codes d'erreur

| Code HTTP                   | Signification         | Cas typiques                           |
| --------------------------- | --------------------- | -------------------------------------- |
| `200 OK`                    | Succès                | GET, PUT, PATCH                        |
| `201 Created`               | Ressource créée       | POST                                   |
| `204 No Content`            | Succès sans contenu   | DELETE                                 |
| `400 Bad Request`           | Requête invalide      | Données manquantes                     |
| `401 Unauthorized`          | Non authentifié       | Token manquant ou invalide             |
| `403 Forbidden`             | Accès refusé          | Rôle insuffisant, ressource d'un autre |
| `404 Not Found`             | Ressource inexistante | ID non trouvé                          |
| `409 Conflict`              | Conflit de données    | Doublon, dépendances actives           |
| `422 Unprocessable Entity`  | Validation échouée    | Champs invalides                       |
| `500 Internal Server Error` | Erreur serveur        | Bug non géré                           |

**Format d'erreur standard :**

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

**Format d'erreur simple :**

```json
{
  "error": "Accès refusé",
  "message": "Vous n'avez pas les droits nécessaires."
}
```

---

## Quick Start

### 1. Connexion Admin

```bash
curl -X POST http://localhost:8000/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ifri.bj", "password": "secret"}'
```

### 2. Utiliser le token

```bash
curl -X GET http://localhost:8000/api/v1/admin/departements \
  -H "Authorization: Bearer 1|xxxxxxxx" \
  -H "Accept: application/json"
```

### 3. Import étudiants

```bash
curl -X POST http://localhost:8000/api/v1/admin/import/etudiants \
  -H "Authorization: Bearer 1|xxxxxxxx" \
  -F "file=@etudiants.csv"
```

---

_Documentation générée automatiquement à partir du code source — Hackathon BYIFRI 2026_
