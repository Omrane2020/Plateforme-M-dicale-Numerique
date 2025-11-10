-- =====================================================
-- SCHEMA MySQL pour la plateforme médicale
-- Gestion des abonnements
-- =====================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS medical_platform
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE medical_platform;

-- =====================================================
-- Table: subscription_plans
-- Stocke tous les plans d'abonnement
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('doctor', 'clinic', 'patient') NOT NULL,
    monthly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    yearly_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    popular BOOLEAN DEFAULT FALSE,
    color ENUM('blue', 'green', 'purple', 'orange') DEFAULT 'blue',
    active BOOLEAN DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_active (active),
    INDEX idx_order (display_order),
    INDEX idx_category_active (category, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: subscription_features
-- Stocke les fonctionnalités de chaque plan
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id VARCHAR(100) NOT NULL,
    feature_name VARCHAR(500) NOT NULL,
    included BOOLEAN DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
    INDEX idx_plan_id (plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Données initiales - Plans Médecins
-- =====================================================
INSERT INTO subscription_plans (id, name, description, category, monthly_price, yearly_price, popular, color, active, display_order) VALUES
('doctor-basic', 'Médecin Solo', 'Pour les médecins débutants', 'doctor', 29.00, 290.00, FALSE, 'blue', TRUE, 1),
('doctor-professional', 'Cabinet Médical', 'Pour les cabinets établis', 'doctor', 59.00, 590.00, TRUE, 'green', TRUE, 2),
('doctor-premium', 'Multi-Praticiens', 'Pour les groupes de médecins', 'doctor', 99.00, 990.00, FALSE, 'purple', TRUE, 3);

-- Fonctionnalités Plan Médecin Solo
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('doctor-basic', 'Jusqu\'à 50 patients', TRUE, 1),
('doctor-basic', 'Gestion RDV médecin (interface dédiée)', TRUE, 2),
('doctor-basic', 'Dossiers médicaux basiques', TRUE, 3),
('doctor-basic', 'Prescriptions électroniques', TRUE, 4),
('doctor-basic', 'Support email', TRUE, 5),
('doctor-basic', 'Rapports basiques', TRUE, 6),
('doctor-basic', 'Application mobile', FALSE, 7),
('doctor-basic', 'Téléconsultation', FALSE, 8),
('doctor-basic', '1 secrétaire avec interface propre RDV', TRUE, 9),
('doctor-basic', 'API intégration', FALSE, 10);

-- Fonctionnalités Plan Cabinet Médical
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('doctor-professional', 'Jusqu\'à 200 patients', TRUE, 1),
('doctor-professional', 'Gestion RDV médecin avancée (interface dédiée)', TRUE, 2),
('doctor-professional', 'Dossiers médicaux avancés', TRUE, 3),
('doctor-professional', 'Prescriptions électroniques', TRUE, 4),
('doctor-professional', 'Support email & téléphone', TRUE, 5),
('doctor-professional', 'Rapports détaillés', TRUE, 6),
('doctor-professional', 'Application mobile', TRUE, 7),
('doctor-professional', 'Téléconsultation (50/mois)', TRUE, 8),
('doctor-professional', '3 secrétaires avec interface propre RDV', TRUE, 9),
('doctor-professional', 'API intégration', TRUE, 10);

-- Fonctionnalités Plan Multi-Praticiens
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('doctor-premium', 'Patients illimités', TRUE, 1),
('doctor-premium', 'Système RDV multi-praticiens (interfaces dédiées)', TRUE, 2),
('doctor-premium', 'Dossiers médicaux complets', TRUE, 3),
('doctor-premium', 'Prescriptions électroniques', TRUE, 4),
('doctor-premium', 'Support 24/7', TRUE, 5),
('doctor-premium', 'Analytics avancés', TRUE, 6),
('doctor-premium', 'Application mobile', TRUE, 7),
('doctor-premium', 'Téléconsultation illimitée', TRUE, 8),
('doctor-premium', 'Secrétaires illimités (interface propre chacun)', TRUE, 9),
('doctor-premium', 'API & intégrations complètes', TRUE, 10);

-- =====================================================
-- Données initiales - Plans Cliniques
-- =====================================================
INSERT INTO subscription_plans (id, name, description, category, monthly_price, yearly_price, popular, color, active, display_order) VALUES
('clinic-standard', 'Clinique Standard', 'Pour les petites cliniques', 'clinic', 199.00, 1990.00, FALSE, 'blue', TRUE, 1),
('clinic-enterprise', 'Hôpital Enterprise', 'Pour les grandes structures', 'clinic', 499.00, 4990.00, TRUE, 'green', TRUE, 2),
('clinic-custom', 'Solution Sur-Mesure', 'Développement personnalisé', 'clinic', 999.00, 9990.00, FALSE, 'purple', TRUE, 3);

-- Fonctionnalités Clinique Standard
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('clinic-standard', 'Jusqu\'à 10 médecins', TRUE, 1),
('clinic-standard', 'Patients illimités', TRUE, 2),
('clinic-standard', 'Gestion multi-services', TRUE, 3),
('clinic-standard', 'Système de facturation', TRUE, 4),
('clinic-standard', 'Gestion des lits', TRUE, 5),
('clinic-standard', 'Rapports financiers', TRUE, 6),
('clinic-standard', 'Support dédié', TRUE, 7),
('clinic-standard', 'Formation du personnel', TRUE, 8),
('clinic-standard', 'Sauvegarde quotidienne', TRUE, 9),
('clinic-standard', 'Intégration laboratoire', TRUE, 10);

-- Fonctionnalités Hôpital Enterprise
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('clinic-enterprise', 'Médecins illimités', TRUE, 1),
('clinic-enterprise', 'Patients illimités', TRUE, 2),
('clinic-enterprise', 'Gestion hospitalière complète', TRUE, 3),
('clinic-enterprise', 'Système ERP intégré', TRUE, 4),
('clinic-enterprise', 'Gestion des urgences', TRUE, 5),
('clinic-enterprise', 'BI et analytics avancés', TRUE, 6),
('clinic-enterprise', 'Support 24/7 prioritaire', TRUE, 7),
('clinic-enterprise', 'Formation continue', TRUE, 8),
('clinic-enterprise', 'Sécurité renforcée', TRUE, 9),
('clinic-enterprise', 'API personnalisées', TRUE, 10);

-- Fonctionnalités Solution Sur-Mesure
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('clinic-custom', 'Architecture personnalisée', TRUE, 1),
('clinic-custom', 'Développement sur-mesure', TRUE, 2),
('clinic-custom', 'Intégrations spécifiques', TRUE, 3),
('clinic-custom', 'Conformité réglementaire', TRUE, 4),
('clinic-custom', 'Déploiement sur site', TRUE, 5),
('clinic-custom', 'Support technique dédié', TRUE, 6),
('clinic-custom', 'SLA garantis', TRUE, 7),
('clinic-custom', 'Formation personnalisée', TRUE, 8),
('clinic-custom', 'Maintenance incluse', TRUE, 9),
('clinic-custom', 'Évolutions continues', TRUE, 10);

-- =====================================================
-- Données initiales - Plans Patients
-- =====================================================
INSERT INTO subscription_plans (id, name, description, category, monthly_price, yearly_price, popular, color, active, display_order) VALUES
('patient-basic', 'Patient Gratuit', 'Accès de base gratuit', 'patient', 0.00, 0.00, TRUE, 'green', TRUE, 1),
('patient-premium', 'Patient Premium', 'Suivi de santé avancé', 'patient', 9.00, 90.00, FALSE, 'blue', TRUE, 2),
('patient-family', 'Famille Premium', 'Pour toute la famille', 'patient', 19.00, 190.00, FALSE, 'purple', TRUE, 3);

-- Fonctionnalités Patient Gratuit
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('patient-basic', 'Prise de rendez-vous', TRUE, 1),
('patient-basic', 'Consultation de dossier', TRUE, 2),
('patient-basic', 'Historique médical', TRUE, 3),
('patient-basic', 'Rappels de RDV', TRUE, 4),
('patient-basic', 'Application mobile', TRUE, 5),
('patient-basic', 'Support client', TRUE, 6),
('patient-basic', 'Téléconsultation', FALSE, 7),
('patient-basic', 'Suivi personnalisé', FALSE, 8),
('patient-basic', 'Analyses avancées', FALSE, 9),
('patient-basic', 'Support prioritaire', FALSE, 10);

-- Fonctionnalités Patient Premium
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('patient-premium', 'Toutes fonctions gratuites', TRUE, 1),
('patient-premium', 'Téléconsultations illimitées', TRUE, 2),
('patient-premium', 'Suivi santé personnalisé', TRUE, 3),
('patient-premium', 'Analyses et graphiques', TRUE, 4),
('patient-premium', 'Rappels médicaments', TRUE, 5),
('patient-premium', 'Objectifs de santé', TRUE, 6),
('patient-premium', 'Partage famille', TRUE, 7),
('patient-premium', 'Support prioritaire', TRUE, 8),
('patient-premium', 'Conseils IA', TRUE, 9),
('patient-premium', 'Espace de stockage étendu', TRUE, 10);

-- Fonctionnalités Famille Premium
INSERT INTO subscription_features (plan_id, feature_name, included, display_order) VALUES
('patient-family', 'Jusqu\'à 6 membres', TRUE, 1),
('patient-family', 'Toutes fonctions Premium', TRUE, 2),
('patient-family', 'Carnet de santé famille', TRUE, 3),
('patient-family', 'Suivi enfants/seniors', TRUE, 4),
('patient-family', 'Urgences famille', TRUE, 5),
('patient-family', 'Partage avec médecins', TRUE, 6),
('patient-family', 'Historique génétique', TRUE, 7),
('patient-family', 'Conseiller santé dédié', TRUE, 8),
('patient-family', 'Assurance santé intégrée', TRUE, 9),
('patient-family', 'Concierge médical', TRUE, 10);

-- =====================================================
-- Requêtes utiles pour l'administration
-- =====================================================

-- Récupérer tous les plans actifs par catégorie
-- SELECT * FROM subscription_plans WHERE category = 'doctor' AND active = TRUE ORDER BY display_order;

-- Récupérer un plan avec ses fonctionnalités
-- SELECT 
--   p.*,
--   f.feature_name,
--   f.included,
--   f.display_order as feature_order
-- FROM subscription_plans p
-- LEFT JOIN subscription_features f ON p.id = f.plan_id
-- WHERE p.id = 'doctor-basic'
-- ORDER BY f.display_order;

-- Désactiver un plan
-- UPDATE subscription_plans SET active = FALSE WHERE id = 'doctor-basic';

-- Modifier le prix d'un plan
-- UPDATE subscription_plans 
-- SET monthly_price = 35.00, yearly_price = 350.00 
-- WHERE id = 'doctor-basic';

-- Ajouter une nouvelle fonctionnalité à un plan
-- INSERT INTO subscription_features (plan_id, feature_name, included, display_order)
-- VALUES ('doctor-basic', 'Nouvelle fonctionnalité', TRUE, 11);

-- Supprimer un plan (cascade supprime aussi les fonctionnalités)
-- DELETE FROM subscription_plans WHERE id = 'doctor-basic';

-- Statistiques sur les plans
-- SELECT 
--   category,
--   COUNT(*) as total_plans,
--   SUM(CASE WHEN active = TRUE THEN 1 ELSE 0 END) as active_plans,
--   AVG(monthly_price) as avg_monthly_price
-- FROM subscription_plans
-- GROUP BY category;
