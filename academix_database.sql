-- ============================================================
-- SCRIPT SQL - Base de données AcademiX
-- Généré le: 16 février 2026
-- SGBD: MySQL 8.0+
-- ============================================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS `academix` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `academix`;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Table: users (Étudiants)
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `nom` VARCHAR(100) NOT NULL,
  `prenom` VARCHAR(100) NOT NULL,
  `universite` VARCHAR(255) NULL,
  `filiere` VARCHAR(255) NULL,
  `niveau` ENUM('L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat') NULL,
  `objectif_moyenne` DECIMAL(4,2) NULL,
  `style_apprentissage` ENUM('visuel', 'auditif', 'kinesthésique') NULL,
  `avatar_url` VARCHAR(500) NULL,
  `xp_total` INT NOT NULL DEFAULT 0,
  `niveau_gamification` INT NOT NULL DEFAULT 1,
  `remember_token` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: matieres (Matières)
-- ============================================================
DROP TABLE IF EXISTS `matieres`;
CREATE TABLE `matieres` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `coefficient` DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  `couleur` VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  `niveau_maitrise` INT NOT NULL DEFAULT 3,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `matieres_user_id_foreign` (`user_id`),
  CONSTRAINT `matieres_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: emploi_temps (Emploi du temps)
-- ============================================================
DROP TABLE IF EXISTS `emploi_temps`;
CREATE TABLE `emploi_temps` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `matiere_id` BIGINT UNSIGNED NOT NULL,
  `jour_semaine` ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NOT NULL,
  `salle` VARCHAR(255) NULL,
  `professeur` VARCHAR(255) NULL,
  `type_cours` ENUM('CM', 'TD', 'TP', 'Autre') NOT NULL DEFAULT 'CM',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `emploi_temps_matiere_id_foreign` (`matiere_id`),
  CONSTRAINT `emploi_temps_matiere_id_foreign` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: taches (Tâches et devoirs)
-- ============================================================
DROP TABLE IF EXISTS `taches`;
CREATE TABLE `taches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `matiere_id` BIGINT UNSIGNED NULL,
  `titre` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `type` ENUM('devoir', 'revision', 'examen', 'projet', 'lecture', 'autre') NOT NULL DEFAULT 'devoir',
  `date_limite` DATETIME NULL,
  `priorite` ENUM('basse', 'moyenne', 'haute') NOT NULL DEFAULT 'moyenne',
  `statut` ENUM('a_faire', 'en_cours', 'termine') NOT NULL DEFAULT 'a_faire',
  `temps_estime` INT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `taches_user_id_foreign` (`user_id`),
  KEY `taches_matiere_id_foreign` (`matiere_id`),
  CONSTRAINT `taches_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `taches_matiere_id_foreign` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: notes (Évaluations)
-- ============================================================
DROP TABLE IF EXISTS `notes`;
CREATE TABLE `notes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `matiere_id` BIGINT UNSIGNED NOT NULL,
  `intitule` VARCHAR(255) NOT NULL,
  `note_obtenue` DECIMAL(5,2) NOT NULL,
  `note_maximale` DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  `coefficient` DECIMAL(3,1) NOT NULL DEFAULT 1.0,
  `date_evaluation` DATE NOT NULL,
  `type_evaluation` ENUM('devoir', 'controle', 'partiel', 'examen', 'projet') NOT NULL DEFAULT 'devoir',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notes_user_id_foreign` (`user_id`),
  KEY `notes_matiere_id_foreign` (`matiere_id`),
  CONSTRAINT `notes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notes_matiere_id_foreign` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: alertes (Système d'alertes early-warning)
-- ============================================================
DROP TABLE IF EXISTS `alertes`;
CREATE TABLE `alertes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `matiere_id` BIGINT UNSIGNED NULL,
  `type_alerte` ENUM('risque_echec', 'moyenne_basse', 'retard_devoirs', 'absence_revision') NOT NULL,
  `niveau_severite` ENUM('info', 'warning', 'danger') NOT NULL DEFAULT 'warning',
  `titre` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `actions_suggerees` JSON NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `is_dismissed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `alertes_user_id_foreign` (`user_id`),
  KEY `alertes_matiere_id_foreign` (`matiere_id`),
  CONSTRAINT `alertes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alertes_matiere_id_foreign` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: ressources_partagees (Bibliothèque collaborative)
-- ============================================================
DROP TABLE IF EXISTS `ressources_partagees`;
CREATE TABLE `ressources_partagees` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `matiere_id` BIGINT UNSIGNED NULL,
  `type_ressource` ENUM('fiche', 'epreuve', 'resume', 'mindmap', 'autre') NOT NULL,
  `titre` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `fichier_url` VARCHAR(255) NOT NULL,
  `tags` JSON NULL,
  `note_moyenne` DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  `nb_telechargements` INT NOT NULL DEFAULT 0,
  `nb_votes` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ressources_partagees_user_id_foreign` (`user_id`),
  KEY `ressources_partagees_matiere_id_foreign` (`matiere_id`),
  CONSTRAINT `ressources_partagees_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ressources_partagees_matiere_id_foreign` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: contenus_ia (Contenus générés par IA)
-- ============================================================
DROP TABLE IF EXISTS `contenus_ia`;
CREATE TABLE `contenus_ia` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `matiere_id` BIGINT UNSIGNED NULL,
  `type_contenu` ENUM('fiche', 'quiz', 'podcast', 'exercices') NOT NULL,
  `titre` VARCHAR(255) NOT NULL,
  `contenu_json` LONGTEXT NOT NULL,
  `source_doc` VARCHAR(255) NULL,
  `fichier_genere` VARCHAR(255) NULL,
  `statut` ENUM('en_cours', 'termine', 'erreur') NOT NULL DEFAULT 'en_cours',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `contenus_ia_user_id_foreign` (`user_id`),
  KEY `contenus_ia_matiere_id_foreign` (`matiere_id`),
  CONSTRAINT `contenus_ia_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contenus_ia_matiere_id_foreign` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: quiz_questions (Questions de quiz)
-- ============================================================
DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `contenu_ia_id` BIGINT UNSIGNED NOT NULL,
  `question` TEXT NOT NULL,
  `options` JSON NOT NULL,
  `reponse_correcte` INT NOT NULL,
  `explication` TEXT NULL,
  `ordre` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quiz_questions_contenu_ia_id_foreign` (`contenu_ia_id`),
  CONSTRAINT `quiz_questions_contenu_ia_id_foreign` FOREIGN KEY (`contenu_ia_id`) REFERENCES `contenus_ia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: quiz_resultats (Résultats des quiz)
-- ============================================================
DROP TABLE IF EXISTS `quiz_resultats`;
CREATE TABLE `quiz_resultats` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `contenu_ia_id` BIGINT UNSIGNED NOT NULL,
  `score` INT NOT NULL,
  `score_max` INT NOT NULL,
  `temps_passe` INT NULL,
  `reponses_donnees` JSON NULL,
  `notions_faibles` JSON NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quiz_resultats_user_id_foreign` (`user_id`),
  KEY `quiz_resultats_contenu_ia_id_foreign` (`contenu_ia_id`),
  CONSTRAINT `quiz_resultats_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_resultats_contenu_ia_id_foreign` FOREIGN KEY (`contenu_ia_id`) REFERENCES `contenus_ia` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: badges (Gamification - Badges)
-- ============================================================
DROP TABLE IF EXISTS `badges`;
CREATE TABLE `badges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(255) NOT NULL,
  `nom` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `icone` VARCHAR(255) NULL,
  `condition_json` JSON NULL,
  `xp_bonus` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `badges_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: user_badges (Badges obtenus par les utilisateurs)
-- ============================================================
DROP TABLE IF EXISTS `user_badges`;
CREATE TABLE `user_badges` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `badge_id` BIGINT UNSIGNED NOT NULL,
  `obtenu_le` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_badges_user_id_badge_id_unique` (`user_id`, `badge_id`),
  KEY `user_badges_user_id_foreign` (`user_id`),
  KEY `user_badges_badge_id_foreign` (`badge_id`),
  CONSTRAINT `user_badges_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_badges_badge_id_foreign` FOREIGN KEY (`badge_id`) REFERENCES `badges` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: statistiques (Statistiques quotidiennes)
-- ============================================================
DROP TABLE IF EXISTS `statistiques`;
CREATE TABLE `statistiques` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `temps_etude_minutes` INT NOT NULL DEFAULT 0,
  `nb_taches_completees` INT NOT NULL DEFAULT 0,
  `nb_quiz_faits` INT NOT NULL DEFAULT 0,
  `nb_sessions_participees` INT NOT NULL DEFAULT 0,
  `moyenne_generale` DECIMAL(5,2) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `statistiques_user_id_date_unique` (`user_id`, `date`),
  KEY `statistiques_user_id_foreign` (`user_id`),
  CONSTRAINT `statistiques_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table: personal_access_tokens (Laravel Sanctum - API Tokens)
-- ============================================================
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255) NOT NULL,
  `tokenable_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `token` VARCHAR(64) NOT NULL,
  `abilities` TEXT NULL,
  `last_used_at` TIMESTAMP NULL,
  `expires_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Données de test (Seeders) - OPTIONNEL
-- ============================================================

-- Utilisateur de test
INSERT INTO `users` (`email`, `password`, `nom`, `prenom`, `universite`, `filiere`, `niveau`, `objectif_moyenne`, `xp_total`, `niveau_gamification`) 
VALUES 
('admin@academix.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'AcademiX', 'IFRI', 'Informatique', 'L3', 14.00, 100, 2),
('etudiant@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dupont', 'Jean', 'Université Paris', 'Informatique', 'L2', 12.00, 50, 1);
-- Mot de passe pour les deux: "password"

-- Badges par défaut
INSERT INTO `badges` (`code`, `nom`, `description`, `icone`, `xp_bonus`) VALUES
('premiere_connexion', 'Premier pas', 'Bienvenue sur AcademiX !', '🎉', 10),
('premiere_note', 'Première évaluation', 'Tu as enregistré ta première note', '📝', 20),
('serie_5_taches', 'Productif', 'Complète 5 tâches', '✅', 50),
('quiz_parfait', 'Sans faute', 'Obtiens 100% à un quiz', '🎯', 100),
('etudiant_semaine', 'Étudiant de la semaine', '7 jours consécutifs de connexion', '🔥', 200);

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
