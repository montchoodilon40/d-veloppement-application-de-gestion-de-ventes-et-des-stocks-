-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 29 oct. 2026 à 09:47
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `commerciale_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `color` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `color`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Électronique', '#6366f1', 'Appareils électroniques et objets connectés.', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(2, 'Informatique', '#0ea5e9', 'Matériel et périphériques informatiques.', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(3, 'Accessoires', '#f59e0b', 'Accessoires du quotidien et connectivité.', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(4, 'Mobilier', '#10b981', 'Mobilier de bureau et de maison.', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(5, 'Papeterie', '#ef4444', 'Fournitures et articles de bureau.', '2026-10-29 05:50:39', '2026-10-29 05:50:39');

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `address`, `city`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Sophie Martin', 'sophie.martin@example.fr', '06 12 34 56 78', '12 rue des Lilas', 'Paris', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(2, 'Thomas Bernard', 'thomas.bernard@example.fr', '06 23 45 67 89', '8 avenue Jean Jaurès', 'Lyon', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(3, 'Camille Dubois', 'camille.dubois@example.fr', '06 34 56 78 90', '45 boulevard de la Mer', 'Marseille', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(4, 'Nicolas Petit', 'nicolas.petit@example.fr', '06 45 67 89 01', '3 place du Capitole', 'Toulouse', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(5, 'Léa Moreau', 'lea.moreau@example.fr', '06 56 78 90 12', '21 cours de l’Intendance', 'Bordeaux', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(6, 'Ahmed Benali', 'ahmed.benali@example.fr', '06 67 89 01 23', '7 rue Nationale', 'Lille', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(7, 'Emma Roux', 'emma.roux@example.fr', '06 78 90 12 34', '16 rue Crébillon', 'Nantes', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(8, 'Lucas Fontaine', 'lucas.fontaine@example.fr', '06 89 01 23 45', '5 rue des Grandes Arcades', 'Strasbourg', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(9, 'Chloé Girard', 'chloe.girard@example.fr', '06 90 12 34 56', '10 promenade des Anglais', 'Nice', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(10, 'Mehdi Lambert', 'mehdi.lambert@example.fr', '07 01 23 45 67', '2 rue de la Monnaie', 'Rennes', NULL, '2026-10-29 05:50:39', '2026-10-29 05:50:39');

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_10_29_000001_create_categories_table', 1),
(5, '2026_10_29_000002_create_products_table', 1),
(6, '2026_10_29_000003_create_clients_table', 1),
(7, '2026_10_29_000004_create_sales_table', 1),
(8, '2026_10_29_000005_create_sale_items_table', 1),
(9, '2026_10_29_000006_create_stock_movements_table', 1);

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reference` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `sale_price` decimal(12,2) NOT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `stock_alert` int(10) UNSIGNED NOT NULL DEFAULT 5,
  `unit` varchar(30) NOT NULL DEFAULT 'unité',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `category_id`, `reference`, `name`, `description`, `purchase_price`, `sale_price`, `stock`, `stock_alert`, `unit`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'ELE-001', 'Smartphone Nova X', NULL, 320.00, 449.00, 24, 5, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(2, 1, 'ELE-002', 'Casque Bluetooth AirBeat', NULL, 45.00, 79.90, 5, 8, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(3, 1, 'ELE-003', 'Enceinte portable Pulse', NULL, 28.00, 49.90, 72, 10, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(4, 1, 'ELE-004', 'Montre connectée FitPro', NULL, 65.00, 109.00, 22, 6, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:40'),
(5, 2, 'INF-001', 'Ordinateur portable ZenBook 14', NULL, 780.00, 1049.00, 13, 4, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(6, 2, 'INF-002', 'Souris sans fil Ergo', NULL, 12.00, 24.90, 0, 15, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(7, 2, 'INF-003', 'Clavier mécanique RGB', NULL, 38.00, 69.90, 32, 8, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(8, 2, 'INF-004', 'Écran 27 pouces UltraSharp', NULL, 210.00, 329.00, 7, 3, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(9, 2, 'INF-005', 'SSD externe 1 To', NULL, 55.00, 89.90, 8, 10, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(10, 3, 'ACC-001', 'Chargeur USB-C 65W', NULL, 15.00, 29.90, 82, 20, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(11, 3, 'ACC-002', 'Câble HDMI 2m', NULL, 4.00, 12.90, 115, 25, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:40'),
(12, 3, 'ACC-003', 'Powerbank 20 000 mAh', NULL, 22.00, 39.90, 41, 12, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(13, 3, 'ACC-004', 'Support téléphone', NULL, 6.00, 14.90, 80, 15, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(14, 3, 'ACC-005', 'Sac à dos urbain', NULL, 25.00, 49.90, 25, 6, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(15, 4, 'MOB-001', 'Bureau compact', NULL, 120.00, 199.00, 1, 2, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(16, 4, 'MOB-002', 'Chaise ergonomique', NULL, 180.00, 299.00, 2, 3, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(17, 4, 'MOB-003', 'Lampe LED de bureau', NULL, 18.00, 34.90, 34, 8, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(18, 5, 'PAP-001', 'Carnet de notes A5', NULL, 3.00, 7.90, 12, 20, 'pièce', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(19, 5, 'PAP-002', 'Stylos gel (lot de 5)', NULL, 2.00, 6.50, 148, 30, 'lot', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41'),
(20, 5, 'PAP-003', 'Bloc-notes autocollants', NULL, 1.50, 4.90, 89, 20, 'lot', 1, '2026-10-29 05:50:39', '2026-10-29 05:50:41');

-- --------------------------------------------------------

--
-- Structure de la table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reference` varchar(255) NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `sale_date` datetime NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(30) NOT NULL DEFAULT 'cash',
  `status` varchar(20) NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sales`
--

INSERT INTO `sales` (`id`, `reference`, `client_id`, `sale_date`, `subtotal`, `discount_amount`, `tax_rate`, `tax_amount`, `total`, `payment_method`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'VTE-20261029-SFJMW', 9, '2026-10-29 05:55:00', 149.70, 0.00, 20.00, 29.94, 179.64, 'card', 'completed', 'Commande livrée en boutique.', '2026-10-29 04:55:00', '2026-10-29 04:55:00'),
(2, 'VTE-20261029-TN6X1', 4, '2026-10-29 04:53:00', 119.70, 0.00, 20.00, 23.94, 143.64, 'transfer', 'completed', NULL, '2026-10-29 03:53:00', '2026-10-29 03:53:00'),
(3, 'VTE-20261029-ZG1NF', 6, '2026-10-29 03:36:00', 1136.60, 56.83, 20.00, 215.95, 1295.72, 'mobile_money', 'completed', NULL, '2026-10-29 02:36:00', '2026-10-29 02:36:00'),
(4, 'VTE-20261028-ODEXN', 5, '2026-10-28 13:06:00', 234.50, 0.00, 20.00, 46.90, 281.40, 'mobile_money', 'completed', NULL, '2026-10-28 12:06:00', '2026-10-28 12:06:00'),
(5, 'VTE-20261027-WLCFJ', 8, '2026-10-27 14:40:00', 23.70, 0.00, 20.00, 4.74, 28.44, 'check', 'completed', NULL, '2026-10-27 13:40:00', '2026-10-27 13:40:00'),
(6, 'VTE-20261026-8I06Y', 9, '2026-10-26 13:10:00', 658.00, 32.90, 20.00, 125.02, 750.12, 'cash', 'completed', NULL, '2026-10-26 12:10:00', '2026-10-26 12:10:00'),
(7, 'VTE-20261025-QIFCY', 1, '2026-10-25 12:58:00', 39.90, 0.00, 20.00, 7.98, 47.88, 'card', 'completed', NULL, '2026-10-25 11:58:00', '2026-10-25 11:58:00'),
(8, 'VTE-20261024-R2YUQ', 7, '2026-10-24 13:50:00', 449.20, 22.46, 20.00, 85.35, 512.09, 'mobile_money', 'completed', 'Commande livrée en boutique.', '2026-10-24 12:50:00', '2026-10-24 12:50:00'),
(9, 'VTE-20261018-XAYHD', 10, '2026-10-18 10:52:00', 74.70, 0.00, 20.00, 14.94, 89.64, 'check', 'completed', NULL, '2026-10-18 09:52:00', '2026-10-18 09:52:00'),
(10, 'VTE-20261007-BXXCA', 9, '2026-10-07 14:27:00', 249.60, 0.00, 20.00, 49.92, 299.52, 'transfer', 'completed', NULL, '2026-10-07 13:27:00', '2026-10-07 13:27:00'),
(11, 'VTE-20261002-RAN7M', 6, '2026-10-02 18:56:00', 73.60, 0.00, 20.00, 14.72, 88.32, 'card', 'completed', NULL, '2026-10-02 17:56:00', '2026-10-02 17:56:00'),
(12, 'VTE-20261013-GEVO5', 8, '2026-10-13 10:59:00', 175.50, 0.00, 20.00, 35.10, 210.60, 'card', 'completed', NULL, '2026-10-13 09:59:00', '2026-10-13 09:59:00'),
(13, 'VTE-20261011-QA2LQ', 1, '2026-10-11 10:09:00', 77.70, 0.00, 20.00, 15.54, 93.24, 'card', 'cancelled', NULL, '2026-10-11 09:09:00', '2026-10-29 05:50:41'),
(14, 'VTE-20261019-GRL5Z', 9, '2026-10-19 18:12:00', 2212.00, 110.60, 20.00, 420.28, 2521.68, 'transfer', 'completed', NULL, '2026-10-19 17:12:00', '2026-10-19 17:12:00'),
(15, 'VTE-20261006-YGRYA', 3, '2026-10-06 14:49:00', 3459.00, 172.95, 20.00, 657.21, 3943.26, 'transfer', 'completed', 'Commande livrée en boutique.', '2026-10-06 13:49:00', '2026-10-06 13:49:00'),
(16, 'VTE-20261003-GHTZL', 3, '2026-10-03 13:59:00', 149.70, 0.00, 20.00, 29.94, 179.64, 'mobile_money', 'completed', NULL, '2026-10-03 12:59:00', '2026-10-03 12:59:00'),
(17, 'VTE-20260809-2QMF0', 7, '2026-08-09 09:26:00', 1381.90, 69.10, 20.00, 262.56, 1575.36, 'check', 'completed', NULL, '2026-08-09 08:26:00', '2026-08-09 08:26:00'),
(18, 'VTE-20260724-4IVSW', 1, '2026-07-24 18:27:00', 199.00, 0.00, 20.00, 39.80, 238.80, 'card', 'completed', NULL, '2026-07-24 17:27:00', '2026-07-24 17:27:00'),
(19, 'VTE-20260622-HZKYP', 7, '2026-06-22 13:33:00', 149.70, 0.00, 20.00, 29.94, 179.64, 'card', 'completed', NULL, '2026-06-22 12:33:00', '2026-06-22 12:33:00'),
(20, 'VTE-20260707-TK4KW', 3, '2026-07-07 18:10:00', 601.90, 30.10, 20.00, 114.36, 686.16, 'mobile_money', 'completed', NULL, '2026-07-07 17:10:00', '2026-07-07 17:10:00'),
(21, 'VTE-20260507-QJICP', 9, '2026-05-07 18:55:00', 99.70, 0.00, 20.00, 19.94, 119.64, 'cash', 'completed', NULL, '2026-05-07 17:55:00', '2026-05-07 17:55:00'),
(22, 'VTE-20260519-C6OCL', 10, '2026-05-19 17:26:00', 2084.80, 104.24, 20.00, 396.11, 2376.67, 'check', 'completed', 'Commande livrée en boutique.', '2026-05-19 16:26:00', '2026-05-19 16:26:00'),
(23, 'VTE-20260913-DSHYV', 8, '2026-09-13 09:30:00', 3524.90, 176.25, 20.00, 669.73, 4018.38, 'card', 'completed', NULL, '2026-09-13 08:30:00', '2026-09-13 08:30:00'),
(24, 'VTE-20260818-9TWLD', 7, '2026-08-18 09:31:00', 344.70, 17.24, 20.00, 65.49, 392.95, 'mobile_money', 'completed', NULL, '2026-08-18 08:31:00', '2026-08-18 08:31:00'),
(25, 'VTE-20260804-ZOS3N', 4, '2026-08-04 18:04:00', 354.30, 17.72, 20.00, 67.32, 403.90, 'mobile_money', 'completed', NULL, '2026-08-04 17:04:00', '2026-08-04 17:04:00');

-- --------------------------------------------------------

--
-- Structure de la table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_reference` varchar(100) DEFAULT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `product_reference`, `quantity`, `unit_price`, `line_total`, `created_at`, `updated_at`) VALUES
(1, 1, 9, 'SSD externe 1 To', 'INF-005', 1, 89.90, 89.90, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(2, 1, 10, 'Chargeur USB-C 65W', 'ACC-001', 2, 29.90, 59.80, '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(3, 2, 12, 'Powerbank 20 000 mAh', 'ACC-003', 3, 39.90, 119.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(4, 3, 9, 'SSD externe 1 To', 'INF-005', 2, 89.90, 179.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(5, 3, 10, 'Chargeur USB-C 65W', 'ACC-001', 2, 29.90, 59.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(6, 3, 16, 'Chaise ergonomique', 'MOB-002', 3, 299.00, 897.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(7, 4, 2, 'Casque Bluetooth AirBeat', 'ELE-002', 2, 79.90, 159.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(8, 4, 6, 'Souris sans fil Ergo', 'INF-002', 3, 24.90, 74.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(9, 5, 18, 'Carnet de notes A5', 'PAP-001', 3, 7.90, 23.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(10, 6, 8, 'Écran 27 pouces UltraSharp', 'INF-004', 2, 329.00, 658.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(11, 7, 12, 'Powerbank 20 000 mAh', 'ACC-003', 1, 39.90, 39.90, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(12, 8, 9, 'SSD externe 1 To', 'INF-005', 3, 89.90, 269.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(13, 8, 10, 'Chargeur USB-C 65W', 'ACC-001', 2, 29.90, 59.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(14, 8, 12, 'Powerbank 20 000 mAh', 'ACC-003', 3, 39.90, 119.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(15, 9, 6, 'Souris sans fil Ergo', 'INF-002', 3, 24.90, 74.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(16, 10, 9, 'SSD externe 1 To', 'INF-005', 2, 89.90, 179.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(17, 10, 17, 'Lampe LED de bureau', 'MOB-003', 2, 34.90, 69.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(18, 11, 11, 'Câble HDMI 2m', 'ACC-002', 3, 12.90, 38.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(19, 11, 17, 'Lampe LED de bureau', 'MOB-003', 1, 34.90, 34.90, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(20, 12, 3, 'Enceinte portable Pulse', 'ELE-003', 3, 49.90, 149.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(21, 12, 11, 'Câble HDMI 2m', 'ACC-002', 2, 12.90, 25.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(22, 13, 13, 'Support téléphone', 'ACC-004', 2, 14.90, 29.80, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(23, 13, 17, 'Lampe LED de bureau', 'MOB-003', 1, 34.90, 34.90, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(24, 13, 19, 'Stylos gel (lot de 5)', 'PAP-002', 2, 6.50, 13.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(25, 14, 1, 'Smartphone Nova X', 'ELE-001', 2, 449.00, 898.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(26, 14, 4, 'Montre connectée FitPro', 'ELE-004', 3, 109.00, 327.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(27, 14, 8, 'Écran 27 pouces UltraSharp', 'INF-004', 3, 329.00, 987.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(28, 15, 5, 'Ordinateur portable ZenBook 14', 'INF-001', 3, 1049.00, 3147.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(29, 15, 16, 'Chaise ergonomique', 'MOB-002', 1, 299.00, 299.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(30, 15, 19, 'Stylos gel (lot de 5)', 'PAP-002', 2, 6.50, 13.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(31, 16, 3, 'Enceinte portable Pulse', 'ELE-003', 3, 49.90, 149.70, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(32, 17, 1, 'Smartphone Nova X', 'ELE-001', 3, 449.00, 1347.00, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(33, 17, 17, 'Lampe LED de bureau', 'MOB-003', 1, 34.90, 34.90, '2026-10-29 05:50:40', '2026-10-29 05:50:40'),
(34, 18, 15, 'Bureau compact', 'MOB-001', 1, 199.00, 199.00, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(35, 19, 14, 'Sac à dos urbain', 'ACC-005', 3, 49.90, 149.70, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(36, 20, 15, 'Bureau compact', 'MOB-001', 3, 199.00, 597.00, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(37, 20, 20, 'Bloc-notes autocollants', 'PAP-003', 1, 4.90, 4.90, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(38, 21, 10, 'Chargeur USB-C 65W', 'ACC-001', 1, 29.90, 29.90, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(39, 21, 17, 'Lampe LED de bureau', 'MOB-003', 2, 34.90, 69.80, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(40, 22, 1, 'Smartphone Nova X', 'ELE-001', 3, 449.00, 1347.00, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(41, 22, 8, 'Écran 27 pouces UltraSharp', 'INF-004', 2, 329.00, 658.00, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(42, 22, 12, 'Powerbank 20 000 mAh', 'ACC-003', 2, 39.90, 79.80, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(43, 23, 1, 'Smartphone Nova X', 'ELE-001', 3, 449.00, 1347.00, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(44, 23, 2, 'Casque Bluetooth AirBeat', 'ELE-002', 1, 79.90, 79.90, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(45, 23, 5, 'Ordinateur portable ZenBook 14', 'INF-001', 2, 1049.00, 2098.00, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(46, 24, 10, 'Chargeur USB-C 65W', 'ACC-001', 1, 29.90, 29.90, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(47, 24, 16, 'Chaise ergonomique', 'MOB-002', 1, 299.00, 299.00, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(48, 24, 18, 'Carnet de notes A5', 'PAP-001', 2, 7.90, 15.80, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(49, 25, 3, 'Enceinte portable Pulse', 'ELE-003', 2, 49.90, 99.80, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(50, 25, 6, 'Souris sans fil Ergo', 'INF-002', 3, 24.90, 74.70, '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(51, 25, 9, 'SSD externe 1 To', 'INF-005', 2, 89.90, 179.80, '2026-10-29 05:50:41', '2026-10-29 05:50:41');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('95q7q8CjjLicgwHDKPxmiz0jpDS6zw6rtJ377H64', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.143.1 Chrome/150.0.7871.250 Electron/43.7.7 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFNUUzVYR1ljcERuUXNmTXgyZGVTZVJOVmlHSnQ4OHU1UWVldUMzNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1793253801);

-- --------------------------------------------------------

--
-- Structure de la table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `quantity` int(11) NOT NULL,
  `stock_before` int(10) UNSIGNED NOT NULL,
  `stock_after` int(10) UNSIGNED NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `sale_id`, `type`, `quantity`, `stock_before`, `stock_after`, `reason`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'in', 35, 0, 35, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(2, 2, NULL, 'in', 42, 0, 42, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(3, 3, NULL, 'in', 60, 0, 60, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(4, 4, NULL, 'in', 25, 0, 25, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(5, 5, NULL, 'in', 18, 0, 18, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(6, 6, NULL, 'in', 70, 0, 70, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(7, 7, NULL, 'in', 32, 0, 32, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(8, 8, NULL, 'in', 14, 0, 14, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(9, 9, NULL, 'in', 45, 0, 45, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(10, 10, NULL, 'in', 90, 0, 90, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(11, 11, NULL, 'in', 120, 0, 120, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(12, 12, NULL, 'in', 50, 0, 50, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(13, 13, NULL, 'in', 80, 0, 80, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(14, 14, NULL, 'in', 28, 0, 28, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(15, 15, NULL, 'in', 9, 0, 9, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(16, 16, NULL, 'in', 7, 0, 7, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(17, 17, NULL, 'in', 40, 0, 40, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(18, 18, NULL, 'in', 100, 0, 100, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(19, 19, NULL, 'in', 150, 0, 150, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(20, 20, NULL, 'in', 90, 0, 90, 'Stock initial', '2026-10-29 05:50:39', '2026-10-29 05:50:39'),
(21, 9, 1, 'out', -1, 45, 44, 'Vente VTE-20261029-SFJMW', '2026-10-29 04:55:00', '2026-10-29 04:55:00'),
(22, 10, 1, 'out', -2, 90, 88, 'Vente VTE-20261029-SFJMW', '2026-10-29 04:55:00', '2026-10-29 04:55:00'),
(23, 12, 2, 'out', -3, 50, 47, 'Vente VTE-20261029-TN6X1', '2026-10-29 03:53:00', '2026-10-29 03:53:00'),
(24, 9, 3, 'out', -2, 44, 42, 'Vente VTE-20261029-ZG1NF', '2026-10-29 02:36:00', '2026-10-29 02:36:00'),
(25, 10, 3, 'out', -2, 88, 86, 'Vente VTE-20261029-ZG1NF', '2026-10-29 02:36:00', '2026-10-29 02:36:00'),
(26, 16, 3, 'out', -3, 7, 4, 'Vente VTE-20261029-ZG1NF', '2026-10-29 02:36:00', '2026-10-29 02:36:00'),
(27, 2, 4, 'out', -2, 42, 40, 'Vente VTE-20261028-ODEXN', '2026-10-28 12:06:00', '2026-10-28 12:06:00'),
(28, 6, 4, 'out', -3, 70, 67, 'Vente VTE-20261028-ODEXN', '2026-10-28 12:06:00', '2026-10-28 12:06:00'),
(29, 18, 5, 'out', -3, 100, 97, 'Vente VTE-20261027-WLCFJ', '2026-10-27 13:40:00', '2026-10-27 13:40:00'),
(30, 8, 6, 'out', -2, 14, 12, 'Vente VTE-20261026-8I06Y', '2026-10-26 12:10:00', '2026-10-26 12:10:00'),
(31, 12, 7, 'out', -1, 47, 46, 'Vente VTE-20261025-QIFCY', '2026-10-25 11:58:00', '2026-10-25 11:58:00'),
(32, 9, 8, 'out', -3, 42, 39, 'Vente VTE-20261024-R2YUQ', '2026-10-24 12:50:00', '2026-10-24 12:50:00'),
(33, 10, 8, 'out', -2, 86, 84, 'Vente VTE-20261024-R2YUQ', '2026-10-24 12:50:00', '2026-10-24 12:50:00'),
(34, 12, 8, 'out', -3, 46, 43, 'Vente VTE-20261024-R2YUQ', '2026-10-24 12:50:00', '2026-10-24 12:50:00'),
(35, 6, 9, 'out', -3, 67, 64, 'Vente VTE-20261018-XAYHD', '2026-10-18 09:52:00', '2026-10-18 09:52:00'),
(36, 9, 10, 'out', -2, 39, 37, 'Vente VTE-20261007-BXXCA', '2026-10-07 13:27:00', '2026-10-07 13:27:00'),
(37, 17, 10, 'out', -2, 40, 38, 'Vente VTE-20261007-BXXCA', '2026-10-07 13:27:00', '2026-10-07 13:27:00'),
(38, 11, 11, 'out', -3, 120, 117, 'Vente VTE-20261002-RAN7M', '2026-10-02 17:56:00', '2026-10-02 17:56:00'),
(39, 17, 11, 'out', -1, 38, 37, 'Vente VTE-20261002-RAN7M', '2026-10-02 17:56:00', '2026-10-02 17:56:00'),
(40, 3, 12, 'out', -3, 60, 57, 'Vente VTE-20261013-GEVO5', '2026-10-13 09:59:00', '2026-10-13 09:59:00'),
(41, 11, 12, 'out', -2, 117, 115, 'Vente VTE-20261013-GEVO5', '2026-10-13 09:59:00', '2026-10-13 09:59:00'),
(42, 13, 13, 'out', -2, 80, 78, 'Vente VTE-20261011-QA2LQ', '2026-10-11 09:09:00', '2026-10-11 09:09:00'),
(43, 17, 13, 'out', -1, 37, 36, 'Vente VTE-20261011-QA2LQ', '2026-10-11 09:09:00', '2026-10-11 09:09:00'),
(44, 19, 13, 'out', -2, 150, 148, 'Vente VTE-20261011-QA2LQ', '2026-10-11 09:09:00', '2026-10-11 09:09:00'),
(45, 1, 14, 'out', -2, 35, 33, 'Vente VTE-20261019-GRL5Z', '2026-10-19 17:12:00', '2026-10-19 17:12:00'),
(46, 4, 14, 'out', -3, 25, 22, 'Vente VTE-20261019-GRL5Z', '2026-10-19 17:12:00', '2026-10-19 17:12:00'),
(47, 8, 14, 'out', -3, 12, 9, 'Vente VTE-20261019-GRL5Z', '2026-10-19 17:12:00', '2026-10-19 17:12:00'),
(48, 5, 15, 'out', -3, 18, 15, 'Vente VTE-20261006-YGRYA', '2026-10-06 13:49:00', '2026-10-06 13:49:00'),
(49, 16, 15, 'out', -1, 4, 3, 'Vente VTE-20261006-YGRYA', '2026-10-06 13:49:00', '2026-10-06 13:49:00'),
(50, 19, 15, 'out', -2, 148, 146, 'Vente VTE-20261006-YGRYA', '2026-10-06 13:49:00', '2026-10-06 13:49:00'),
(51, 3, 16, 'out', -3, 57, 54, 'Vente VTE-20261003-GHTZL', '2026-10-03 12:59:00', '2026-10-03 12:59:00'),
(52, 1, 17, 'out', -3, 33, 30, 'Vente VTE-20260809-2QMF0', '2026-08-09 08:26:00', '2026-08-09 08:26:00'),
(53, 17, 17, 'out', -1, 36, 35, 'Vente VTE-20260809-2QMF0', '2026-08-09 08:26:00', '2026-08-09 08:26:00'),
(54, 15, 18, 'out', -1, 9, 8, 'Vente VTE-20260724-4IVSW', '2026-07-24 17:27:00', '2026-07-24 17:27:00'),
(55, 14, 19, 'out', -3, 28, 25, 'Vente VTE-20260622-HZKYP', '2026-06-22 12:33:00', '2026-06-22 12:33:00'),
(56, 15, 20, 'out', -3, 8, 5, 'Vente VTE-20260707-TK4KW', '2026-07-07 17:10:00', '2026-07-07 17:10:00'),
(57, 20, 20, 'out', -1, 90, 89, 'Vente VTE-20260707-TK4KW', '2026-07-07 17:10:00', '2026-07-07 17:10:00'),
(58, 10, 21, 'out', -1, 84, 83, 'Vente VTE-20260507-QJICP', '2026-05-07 17:55:00', '2026-05-07 17:55:00'),
(59, 17, 21, 'out', -2, 35, 33, 'Vente VTE-20260507-QJICP', '2026-05-07 17:55:00', '2026-05-07 17:55:00'),
(60, 1, 22, 'out', -3, 30, 27, 'Vente VTE-20260519-C6OCL', '2026-05-19 16:26:00', '2026-05-19 16:26:00'),
(61, 8, 22, 'out', -2, 9, 7, 'Vente VTE-20260519-C6OCL', '2026-05-19 16:26:00', '2026-05-19 16:26:00'),
(62, 12, 22, 'out', -2, 43, 41, 'Vente VTE-20260519-C6OCL', '2026-05-19 16:26:00', '2026-05-19 16:26:00'),
(63, 1, 23, 'out', -3, 27, 24, 'Vente VTE-20260913-DSHYV', '2026-09-13 08:30:00', '2026-09-13 08:30:00'),
(64, 2, 23, 'out', -1, 40, 39, 'Vente VTE-20260913-DSHYV', '2026-09-13 08:30:00', '2026-09-13 08:30:00'),
(65, 5, 23, 'out', -2, 15, 13, 'Vente VTE-20260913-DSHYV', '2026-09-13 08:30:00', '2026-09-13 08:30:00'),
(66, 10, 24, 'out', -1, 83, 82, 'Vente VTE-20260818-9TWLD', '2026-08-18 08:31:00', '2026-08-18 08:31:00'),
(67, 16, 24, 'out', -1, 3, 2, 'Vente VTE-20260818-9TWLD', '2026-08-18 08:31:00', '2026-08-18 08:31:00'),
(68, 18, 24, 'out', -2, 97, 95, 'Vente VTE-20260818-9TWLD', '2026-08-18 08:31:00', '2026-08-18 08:31:00'),
(69, 3, 25, 'out', -2, 54, 52, 'Vente VTE-20260804-ZOS3N', '2026-08-04 17:04:00', '2026-08-04 17:04:00'),
(70, 6, 25, 'out', -3, 64, 61, 'Vente VTE-20260804-ZOS3N', '2026-08-04 17:04:00', '2026-08-04 17:04:00'),
(71, 9, 25, 'out', -2, 37, 35, 'Vente VTE-20260804-ZOS3N', '2026-08-04 17:04:00', '2026-08-04 17:04:00'),
(72, 13, 13, 'in', 2, 78, 80, 'Annulation de la vente VTE-20261011-QA2LQ', '2026-10-11 09:09:00', '2026-10-11 09:09:00'),
(73, 17, 13, 'in', 1, 33, 34, 'Annulation de la vente VTE-20261011-QA2LQ', '2026-10-11 09:09:00', '2026-10-11 09:09:00'),
(74, 19, 13, 'in', 2, 146, 148, 'Annulation de la vente VTE-20261011-QA2LQ', '2026-10-11 09:09:00', '2026-10-11 09:09:00'),
(75, 3, NULL, 'in', 20, 52, 72, 'Réapprovisionnement fournisseur', '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(76, 2, NULL, 'adjustment', -34, 39, 5, 'Inventaire de démonstration', '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(77, 6, NULL, 'adjustment', -61, 61, 0, 'Inventaire de démonstration', '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(78, 9, NULL, 'adjustment', -27, 35, 8, 'Inventaire de démonstration', '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(79, 15, NULL, 'adjustment', -4, 5, 1, 'Inventaire de démonstration', '2026-10-29 05:50:41', '2026-10-29 05:50:41'),
(80, 18, NULL, 'adjustment', -83, 95, 12, 'Inventaire de démonstration', '2026-10-29 05:50:41', '2026-10-29 05:50:41');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Index pour la table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_unique` (`name`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `clients_name_index` (`name`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Index pour la table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_reference_unique` (`reference`),
  ADD KEY `products_category_id_is_active_index` (`category_id`,`is_active`),
  ADD KEY `products_stock_index` (`stock`);

--
-- Index pour la table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sales_reference_unique` (`reference`),
  ADD KEY `sales_sale_date_status_index` (`sale_date`,`status`),
  ADD KEY `sales_client_id_index` (`client_id`);

--
-- Index pour la table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_items_sale_id_foreign` (`sale_id`),
  ADD KEY `sale_items_product_id_index` (`product_id`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Index pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_sale_id_foreign` (`sale_id`),
  ADD KEY `stock_movements_product_id_created_at_index` (`product_id`,`created_at`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

--
-- Contraintes pour la table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
