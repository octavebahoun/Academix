# 🗄️ Base de Données - AcademiX Platform

**SGBD**: MySQL 8.0  
**ORM**: Laravel Eloquent  
**Database**: `academix`

---

## 📊 Schéma Relationnel Complet

### Vue d'ensemble des tables

```
users (étudiants)
├── matieres (matières suivies)
├── taches (devoirs & tâches)
├── notes (évaluations)
├── alertes (early warning)
├── sessions_collaboratives
├── ressources_partagees
├── contenus_ia (contenus générés)
├── quiz_resultats
├── badges (gamification)
└── notifications
```

---

## 👤 Table: `users`

Étudiants inscrits sur la plateforme

| Colonne               | Type         | Contrainte         | Description                    |
| --------------------- | ------------ | ------------------ | ------------------------------ |
| `id`                  | BIGINT       | PK, AUTO_INCREMENT | Identifiant unique             |
| `email`               | VARCHAR(255) | UNIQUE, NOT NULL   | Email de connexion             |
| `email_verified_at`   | TIMESTAMP    | NULLABLE           | Vérification email             |
| `password`            | VARCHAR(255) | NOT NULL           | Hash bcrypt                    |
| `nom`                 | VARCHAR(100) | NOT NULL           | Nom de famille                 |
| `prenom`              | VARCHAR(100) | NOT NULL           | Prénom                         |
| `universite`          | VARCHAR(255) | NOT NULL           | Nom université                 |
| `filiere`             | VARCHAR(255) | NOT NULL           | Filière d'études               |
| `niveau`              | ENUM         | NOT NULL           | L1, L2, L3, M1, M2, Doctorat   |
| `objectif_moyenne`    | DECIMAL(4,2) | DEFAULT 12.00      | Moyenne visée                  |
| `style_apprentissage` | ENUM         | NULLABLE           | visuel, auditif, kinesthésique |
| `avatar_url`          | VARCHAR(500) | NULLABLE           | URL photo profil               |
| `xp_total`            | INT          | DEFAULT 0          | Points XP gamification         |
| `niveau_gamification` | INT          | DEFAULT 1          | Niveau actuel                  |
| `remember_token`      | VARCHAR(100) | NULLABLE           | Token "Se souvenir"            |
| `created_at`          | TIMESTAMP    |                    | Date inscription               |
| `updated_at`          | TIMESTAMP    |                    | Dernière modification          |

**Indexes:**

- PRIMARY: `id`
- UNIQUE: `email`

**Migration:**

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('email', 255)->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->string('nom', 100);
    $table->string('prenom', 100);
    $table->string('universite', 255);
    $table->string('filiere', 255);
    $table->enum('niveau', ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat']);
    $table->decimal('objectif_moyenne', 4, 2)->default(12.00);
    $table->enum('style_apprentissage', ['visuel', 'auditif', 'kinesthésique'])->nullable();
    $table->string('avatar_url', 500)->nullable();
    $table->integer('xp_total')->default(0);
    $table->integer('niveau_gamification')->default(1);
    $table->rememberToken();
    $table->timestamps();
});
```

---

## 📚 Table: `matieres`

Matières suivies par les étudiants

| Colonne       | Type         | Contrainte         | Description                |
| ------------- | ------------ | ------------------ | -------------------------- |
| `id`          | BIGINT       | PK, AUTO_INCREMENT | Identifiant unique         |
| `user_id`     | BIGINT       | FK → users.id      | Étudiant propriétaire      |
| `nom`         | VARCHAR(255) | NOT NULL           | Nom de la matière          |
| `code`        | VARCHAR(50)  | NULLABLE           | Code matière (ex: INFO301) |
| `coefficient` | INT          | DEFAULT 1          | Coefficient matière        |
| `couleur`     | VARCHAR(7)   | DEFAULT '#3B82F6'  | Couleur hex (UI)           |
| `semestre`    | ENUM         | NULLABLE           | S1, S2                     |
| `created_at`  | TIMESTAMP    |                    |                            |
| `updated_at`  | TIMESTAMP    |                    |                            |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEY: `user_id` → `users(id)` ON DELETE CASCADE
- INDEX: `user_id`

**Relations:**

- `user()` → BelongsTo User
- `taches()` → HasMany Tache
- `notes()` → HasMany Note

---

## 📅 Table: `emploi_temps`

Cours planifiés dans la semaine

| Colonne        | Type         | Contrainte       | Description                 |
| -------------- | ------------ | ---------------- | --------------------------- |
| `id`           | BIGINT       | PK               |                             |
| `user_id`      | BIGINT       | FK → users.id    |                             |
| `matiere_id`   | BIGINT       | FK → matieres.id |                             |
| `jour_semaine` | ENUM         | NOT NULL         | lundi, mardi, ..., dimanche |
| `heure_debut`  | TIME         | NOT NULL         | Ex: 08:00:00                |
| `heure_fin`    | TIME         | NOT NULL         | Ex: 10:00:00                |
| `salle`        | VARCHAR(100) | NULLABLE         | Salle de cours              |
| `type_cours`   | ENUM         | NULLABLE         | CM, TD, TP                  |
| `created_at`   | TIMESTAMP    |                  |                             |
| `updated_at`   | TIMESTAMP    |                  |                             |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEYS: `user_id`, `matiere_id`
- INDEX: `(user_id, jour_semaine)`

---

## ✅ Table: `taches`

Devoirs et tâches à réaliser

| Colonne         | Type         | Contrainte                 | Description                   |
| --------------- | ------------ | -------------------------- | ----------------------------- |
| `id`            | BIGINT       | PK                         |                               |
| `user_id`       | BIGINT       | FK → users.id              |                               |
| `matiere_id`    | BIGINT       | FK → matieres.id, NULLABLE |                               |
| `titre`         | VARCHAR(255) | NOT NULL                   | Titre tâche                   |
| `description`   | TEXT         | NULLABLE                   | Description détaillée         |
| `date_limite`   | DATETIME     | NOT NULL                   | Deadline                      |
| `priorite`      | ENUM         | DEFAULT 'moyenne'          | basse, moyenne, haute         |
| `statut`        | ENUM         | DEFAULT 'pending'          | pending, completed, cancelled |
| `rappel_envoye` | BOOLEAN      | DEFAULT false              | Rappel envoyé ?               |
| `completed_at`  | TIMESTAMP    | NULLABLE                   | Date complétion               |
| `created_at`    | TIMESTAMP    |                            |                               |
| `updated_at`    | TIMESTAMP    |                            |                               |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEYS: `user_id`, `matiere_id`
- INDEX: `(user_id, statut, date_limite)`

**Relations:**

- `user()` → BelongsTo User
- `matiere()` → BelongsTo Matiere

---

## 📊 Table: `notes`

Évaluations et résultats

| Colonne           | Type         | Contrainte       | Description               |
| ----------------- | ------------ | ---------------- | ------------------------- |
| `id`              | BIGINT       | PK               |                           |
| `user_id`         | BIGINT       | FK → users.id    |                           |
| `matiere_id`      | BIGINT       | FK → matieres.id |                           |
| `note_obtenue`    | DECIMAL(5,2) | NOT NULL         | Ex: 16.50                 |
| `note_max`        | DECIMAL(5,2) | DEFAULT 20.00    | Note maximale             |
| `coefficient`     | INT          | DEFAULT 1        | Coeff évaluation          |
| `type_evaluation` | VARCHAR(100) | NULLABLE         | Partiel, Examen, TP, etc. |
| `date_evaluation` | DATE         | NOT NULL         | Date de l'éval            |
| `commentaire`     | TEXT         | NULLABLE         | Commentaire prof          |
| `created_at`      | TIMESTAMP    |                  |                           |
| `updated_at`      | TIMESTAMP    |                  |                           |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEYS: `user_id`, `matiere_id`
- INDEX: `(user_id, matiere_id, date_evaluation)`

**Relations:**

- `user()` → BelongsTo User
- `matiere()` → BelongsTo Matiere

---

## ⚠️ Table: `alertes`

Early Warning System

| Colonne             | Type         | Contrainte       | Description                              |
| ------------------- | ------------ | ---------------- | ---------------------------------------- |
| `id`                | BIGINT       | PK               |                                          |
| `user_id`           | BIGINT       | FK → users.id    |                                          |
| `type_alerte`       | ENUM         | NOT NULL         | moyenne_faible, deadline_proche, absence |
| `niveau_severite`   | ENUM         | DEFAULT 'faible' | faible, moyen, eleve                     |
| `titre`             | VARCHAR(255) | NOT NULL         |                                          |
| `message`           | TEXT         | NOT NULL         |                                          |
| `actions_suggerees` | JSON         | NULLABLE         | Tableau d'actions                        |
| `is_read`           | BOOLEAN      | DEFAULT false    |                                          |
| `created_at`        | TIMESTAMP    |                  |                                          |
| `updated_at`        | TIMESTAMP    |                  |                                          |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEY: `user_id`
- INDEX: `(user_id, is_read, created_at)`

---

## 👥 Table: `sessions_collaboratives`

Sessions de révision

| Colonne            | Type         | Contrainte                 | Description                   |
| ------------------ | ------------ | -------------------------- | ----------------------------- |
| `id`               | BIGINT       | PK                         |                               |
| `createur_id`      | BIGINT       | FK → users.id              | Créateur session              |
| `matiere_id`       | BIGINT       | FK → matieres.id, NULLABLE |                               |
| `titre`            | VARCHAR(255) | NOT NULL                   |                               |
| `description`      | TEXT         | NULLABLE                   |                               |
| `date_debut`       | DATETIME     | NOT NULL                   |                               |
| `duree_minutes`    | INT          | NOT NULL                   | Durée session                 |
| `format`           | ENUM         | NOT NULL                   | visio, presentiel, chat       |
| `max_participants` | INT          | DEFAULT 10                 | Limite participants           |
| `lien_visio`       | VARCHAR(500) | NULLABLE                   | URL meet                      |
| `statut`           | ENUM         | DEFAULT 'planifiee'        | planifiee, en_cours, terminee |
| `created_at`       | TIMESTAMP    |                            |                               |
| `updated_at`       | TIMESTAMP    |                            |                               |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEYS: `createur_id`, `matiere_id`
- INDEX: `(date_debut, statut)`

**Relations:**

- `createur()` → BelongsTo User
- `matiere()` → BelongsTo Matiere
- `participants()` → BelongsToMany User

---

## 🔗 Table: `inscriptions_sessions`

Participants aux sessions (pivot)

| Colonne       | Type      | Contrainte                      | Description             |
| ------------- | --------- | ------------------------------- | ----------------------- |
| `id`          | BIGINT    | PK                              |                         |
| `session_id`  | BIGINT    | FK → sessions_collaboratives.id |                         |
| `user_id`     | BIGINT    | FK → users.id                   |                         |
| `role`        | ENUM      | DEFAULT 'participant'           | participant, moderateur |
| `note`        | INT       | NULLABLE                        | Note /5 (après session) |
| `commentaire` | TEXT      | NULLABLE                        |                         |
| `created_at`  | TIMESTAMP |                                 |                         |
| `updated_at`  | TIMESTAMP |                                 |                         |

**Indexes:**

- PRIMARY: `id`
- UNIQUE: `(session_id, user_id)`
- FOREIGN KEYS: `session_id`, `user_id`

---

## 📁 Table: `ressources_partagees`

Bibliothèque collaborative

| Colonne              | Type         | Contrainte                 | Description             |
| -------------------- | ------------ | -------------------------- | ----------------------- |
| `id`                 | BIGINT       | PK                         |                         |
| `user_id`            | BIGINT       | FK → users.id              | Uploader                |
| `matiere_id`         | BIGINT       | FK → matieres.id, NULLABLE |                         |
| `titre`              | VARCHAR(255) | NOT NULL                   |                         |
| `description`        | TEXT         | NULLABLE                   |                         |
| `type_ressource`     | ENUM         | NOT NULL                   | pdf, video, lien, autre |
| `fichier_url`        | VARCHAR(500) | NULLABLE                   | Stockage fichier        |
| `tags`               | JSON         | NULLABLE                   | Tags recherche          |
| `note_moyenne`       | DECIMAL(3,2) | DEFAULT 0.00               | Note /5                 |
| `nb_vues`            | INT          | DEFAULT 0                  |                         |
| `nb_telechargements` | INT          | DEFAULT 0                  |                         |
| `created_at`         | TIMESTAMP    |                            |                         |
| `updated_at`         | TIMESTAMP    |                            |                         |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEYS: `user_id`, `matiere_id`
- INDEX: `(matiere_id, note_moyenne DESC)`

---

## 🤖 Table: `contenus_ia`

Contenus générés par IA

| Colonne           | Type         | Contrainte                 | Description                     |
| ----------------- | ------------ | -------------------------- | ------------------------------- |
| `id`              | BIGINT       | PK                         |                                 |
| `user_id`         | BIGINT       | FK → users.id              |                                 |
| `matiere_id`      | BIGINT       | FK → matieres.id, NULLABLE |                                 |
| `type_contenu`    | ENUM         | NOT NULL                   | fiche, quiz, podcast, exercices |
| `titre`           | VARCHAR(255) | NOT NULL                   |                                 |
| `contenu_json`    | JSON         | NOT NULL                   | Contenu structuré               |
| `source_document` | VARCHAR(500) | NULLABLE                   | PDF/doc source                  |
| `modele_ia`       | VARCHAR(50)  | NULLABLE                   | gpt-4, claude-3, etc.           |
| `created_at`      | TIMESTAMP    |                            |                                 |
| `updated_at`      | TIMESTAMP    |                            |                                 |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEYS: `user_id`, `matiere_id`
- INDEX: `(user_id, type_contenu, created_at DESC)`

---

## 🧩 Table: `quiz_questions`

Banque de questions pour quiz

| Colonne                  | Type      | Contrainte                    | Description               |
| ------------------------ | --------- | ----------------------------- | ------------------------- |
| `id`                     | BIGINT    | PK                            |                           |
| `matiere_id`             | BIGINT    | FK → matieres.id              |                           |
| `contenu_ia_id`          | BIGINT    | FK → contenus_ia.id, NULLABLE | Source IA                 |
| `question`               | TEXT      | NOT NULL                      |                           |
| `options`                | JSON      | NOT NULL                      | Array d'options           |
| `reponse_correcte_index` | INT       | NOT NULL                      | Index bonne réponse (0-3) |
| `explication`            | TEXT      | NULLABLE                      |                           |
| `difficulte`             | ENUM      | DEFAULT 'moyen'               | facile, moyen, difficile  |
| `created_at`             | TIMESTAMP |                               |                           |
| `updated_at`             | TIMESTAMP |                               |                           |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEYS: `matiere_id`, `contenu_ia_id`
- INDEX: `(matiere_id, difficulte)`

---

## 📈 Table: `quiz_resultats`

Performances aux quiz

| Colonne                | Type      | Contrainte    | Description            |
| ---------------------- | --------- | ------------- | ---------------------- |
| `id`                   | BIGINT    | PK            |                        |
| `user_id`              | BIGINT    | FK → users.id |                        |
| `quiz_id`              | BIGINT    | NULLABLE      | ID quiz (si quiz live) |
| `nb_questions`         | INT       | NOT NULL      |                        |
| `nb_correctes`         | INT       | NOT NULL      |                        |
| `score`                | INT       | NOT NULL      | Points obtenus         |
| `temps_passe_secondes` | INT       | NULLABLE      |                        |
| `notions_faibles`      | JSON      | NULLABLE      | Concepts à revoir      |
| `created_at`           | TIMESTAMP |               |                        |
| `updated_at`           | TIMESTAMP |               |                        |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEY: `user_id`
- INDEX: `(user_id, created_at DESC)`

---

## 🏆 Table: `badges`

Système de gamification

| Colonne          | Type         | Contrainte       | Description                  |
| ---------------- | ------------ | ---------------- | ---------------------------- |
| `id`             | BIGINT       | PK               |                              |
| `code`           | VARCHAR(50)  | UNIQUE, NOT NULL | premiere_note, serie_5, etc. |
| `nom`            | VARCHAR(255) | NOT NULL         |                              |
| `description`    | TEXT         | NOT NULL         |                              |
| `icone_url`      | VARCHAR(500) | NULLABLE         |                              |
| `xp_recompense`  | INT          | DEFAULT 0        | XP gagnés                    |
| `condition_json` | JSON         | NULLABLE         | Conditions d'obtention       |
| `created_at`     | TIMESTAMP    |                  |                              |
| `updated_at`     | TIMESTAMP    |                  |                              |

---

## 🔗 Table: `user_badges`

Badges obtenus (pivot)

| Colonne     | Type      | Contrainte     | Description |
| ----------- | --------- | -------------- | ----------- |
| `id`        | BIGINT    | PK             |             |
| `user_id`   | BIGINT    | FK → users.id  |             |
| `badge_id`  | BIGINT    | FK → badges.id |             |
| `obtenu_le` | TIMESTAMP | NOT NULL       |             |

**Indexes:**

- UNIQUE: `(user_id, badge_id)`
- FOREIGN KEYS: `user_id`, `badge_id`

---

## 🔔 Table: `notifications`

Système de notifications

| Colonne       | Type         | Contrainte    | Description              |
| ------------- | ------------ | ------------- | ------------------------ |
| `id`          | BIGINT       | PK            |                          |
| `user_id`     | BIGINT       | FK → users.id |                          |
| `type`        | VARCHAR(50)  | NOT NULL      | new_note, deadline, etc. |
| `titre`       | VARCHAR(255) | NOT NULL      |                          |
| `message`     | TEXT         | NOT NULL      |                          |
| `lien_action` | VARCHAR(500) | NULLABLE      | URL à ouvrir             |
| `is_read`     | BOOLEAN      | DEFAULT false |                          |
| `created_at`  | TIMESTAMP    |               |                          |
| `updated_at`  | TIMESTAMP    |               |                          |

**Indexes:**

- PRIMARY: `id`
- FOREIGN KEY: `user_id`
- INDEX: `(user_id, is_read, created_at DESC)`

---

## 🔗 Relations Principales

```
users
├── 1:N → matieres
├── 1:N → taches
├── 1:N → notes
├── 1:N → alertes
├── 1:N → sessions_collaboratives (créées)
├── N:M → sessions_collaboratives (participations)
├── 1:N → ressources_partagees
├── 1:N → contenus_ia
├── 1:N → quiz_resultats
├── N:M → badges
└── 1:N → notifications

matieres
├── 1:N → taches
├── 1:N → notes
├── 1:N → emploi_temps
├── 1:N → sessions_collaboratives
├── 1:N → ressources_partagees
├── 1:N → contenus_ia
└── 1:N → quiz_questions

contenus_ia
└── 1:N → quiz_questions
```

---

## 🚀 Commandes Migration

### Créer toutes les tables

```bash
cd backend/laravel
php artisan migrate
```

### Rollback dernière migration

```bash
php artisan migrate:rollback
```

### Reset complet + migrate

```bash
php artisan migrate:fresh
```

### Seeder avec données de test

```bash
php artisan migrate:fresh --seed
```

---

## 📊 Exemple de Seeders

### UserSeeder

```php
User::create([
    'email' => 'etudiant@test.com',
    'password' => bcrypt('password'),
    'nom' => 'Dupont',
    'prenom' => 'Jean',
    'universite' => 'Université de Paris',
    'filiere' => 'Informatique',
    'niveau' => 'L3',
    'objectif_moyenne' => 14.0
]);
```

### MatiereSeeder

```php
Matiere::create([
    'user_id' => 1,
    'nom' => 'Algorithmique',
    'coefficient' => 3,
    'couleur' => '#3B82F6'
]);
```

---

**Dernière mise à jour**: 24 février 2026  
**Version**: 1.0.0
