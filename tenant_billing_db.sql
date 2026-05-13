-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 13, 2026 at 05:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tenant_billing_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `billing_settings`
--

CREATE TABLE `billing_settings` (
  `id` int(11) NOT NULL,
  `water_rate` decimal(10,2) NOT NULL DEFAULT 42.60,
  `electric_rate` decimal(10,2) NOT NULL DEFAULT 16.00,
  `default_monthly_rent` decimal(10,2) NOT NULL DEFAULT 3000.00,
  `utility_due_day` int(11) NOT NULL DEFAULT 2,
  `rent_due_day` int(11) NOT NULL DEFAULT 5,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billing_settings`
--

INSERT INTO `billing_settings` (`id`, `water_rate`, `electric_rate`, `default_monthly_rent`, `utility_due_day`, `rent_due_day`, `updated_at`) VALUES
(1, 55.00, 2.00, 3000.00, 2, 5, '2026-05-12 11:18:10');

-- --------------------------------------------------------

--
-- Table structure for table `calendar_dates`
--

CREATE TABLE `calendar_dates` (
  `id` int(11) NOT NULL,
  `full_date` date NOT NULL,
  `date_key` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` int(11) NOT NULL,
  `quarter_label` varchar(10) NOT NULL,
  `num_month` int(11) NOT NULL,
  `month_name` varchar(20) NOT NULL,
  `short_month` varchar(10) NOT NULL,
  `month_label` varchar(30) NOT NULL,
  `month_key` int(11) NOT NULL,
  `day` int(11) NOT NULL,
  `day_of_year` int(11) NOT NULL,
  `day_of_week` int(11) NOT NULL,
  `day_name` varchar(20) NOT NULL,
  `short_day` varchar(10) NOT NULL,
  `week_of_year` int(11) NOT NULL,
  `iso_week` int(11) NOT NULL,
  `is_weekend` tinyint(1) NOT NULL,
  `is_month_start` tinyint(1) NOT NULL,
  `is_month_end` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `bill_type` enum('utility_electric','utility_water','rent') NOT NULL,
  `bill_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date_paid` date NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `data_scope` enum('demo','personal') DEFAULT 'demo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `tenant_id`, `bill_type`, `bill_id`, `amount`, `date_paid`, `notes`, `data_scope`, `created_at`) VALUES
(2, 2, 'utility_electric', 5, 660.00, '2025-09-17', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(3, 2, 'utility_water', 5, 350.00, '2025-09-30', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(4, 2, 'rent', 5, 3000.00, '2025-09-17', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(5, 2, 'utility_electric', 6, 794.00, '2025-11-01', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(6, 2, 'utility_water', 6, 400.00, '2025-10-23', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(7, 2, 'rent', 6, 3000.00, '2025-10-14', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(8, 2, 'utility_electric', 7, 983.25, '2025-11-28', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(9, 2, 'utility_water', 7, 373.59, '2025-11-28', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(10, 2, 'rent', 7, 3000.00, '2025-11-18', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(11, 2, 'utility_electric', 8, 658.95, '2025-12-28', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(12, 2, 'utility_water', 8, 392.59, '2025-12-28', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(13, 2, 'rent', 8, 3000.00, '2025-12-12', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(14, 2, 'utility_electric', 9, 853.00, '2026-02-02', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(15, 2, 'utility_water', 9, 406.00, '2026-02-02', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(16, 2, 'rent', 9, 3000.00, '2026-01-17', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(17, 2, 'utility_electric', 10, 756.00, '2026-03-01', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(18, 2, 'utility_water', 10, 406.56, '2026-03-01', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(19, 2, 'rent', 10, 3000.00, '2026-02-15', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(20, 2, 'utility_electric', 11, 593.60, '2026-03-28', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(21, 2, 'utility_water', 11, 312.42, '2026-03-28', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(22, 2, 'rent', 11, 3000.00, '2026-03-16', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(23, 2, 'utility_electric', 12, 792.00, '2026-05-01', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(24, 2, 'utility_water', 12, 387.66, '2026-03-28', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(25, 2, 'rent', 12, 3000.00, '2026-04-15', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(26, 2, 'utility_water', 13, 200.00, '2026-05-01', 'Historical payment from sheet', 'personal', '2026-05-12 12:21:23'),
(36, 4, 'utility_water', 18, 440.00, '2026-06-01', 'Full water payment test', 'demo', '2026-05-13 02:12:03'),
(37, 4, 'utility_electric', 18, 120.00, '2026-06-01', 'Full electric payment test', 'demo', '2026-05-13 02:12:03'),
(38, 4, 'rent', 18, 3000.00, '2026-06-03', 'Full rent payment test', 'demo', '2026-05-13 02:12:03'),
(39, 5, 'utility_water', 19, 300.00, '2026-06-01', 'Partial water payment 1', 'demo', '2026-05-13 02:12:03'),
(40, 5, 'utility_water', 19, 200.00, '2026-06-04', 'Partial water payment 2', 'demo', '2026-05-13 02:12:03'),
(41, 5, 'utility_electric', 19, 100.00, '2026-06-05', 'Partial electric payment', 'demo', '2026-05-13 02:12:03'),
(42, 5, 'rent', 19, 1000.00, '2026-06-02', 'Partial rent payment 1', 'demo', '2026-05-13 02:12:03'),
(43, 5, 'rent', 19, 750.00, '2026-06-07', 'Partial rent payment 2', 'demo', '2026-05-13 02:12:03'),
(44, 5, 'utility_water', 21, 440.00, '2026-07-01', 'Full water payment for June cycle', 'demo', '2026-05-13 02:12:03');

-- --------------------------------------------------------

--
-- Table structure for table `rent_bills`
--

CREATE TABLE `rent_bills` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `billing_period` varchar(100) NOT NULL,
  `due_date` date NOT NULL,
  `rent_amount` decimal(10,2) NOT NULL,
  `previous_unpaid_balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `rent_paid_date` date DEFAULT NULL,
  `data_scope` enum('demo','personal') DEFAULT 'demo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rent_bills`
--

INSERT INTO `rent_bills` (`id`, `tenant_id`, `billing_period`, `due_date`, `rent_amount`, `previous_unpaid_balance`, `amount_paid`, `rent_paid_date`, `data_scope`, `created_at`) VALUES
(4, 2, 'April 25, 2026 – May 25, 2026', '2026-06-04', 3000.00, 0.00, 0.00, NULL, 'personal', '2026-05-12 11:49:11'),
(5, 2, 'July 25, 2025 – August 25, 2025', '2025-09-05', 3000.00, 0.00, 0.00, '2025-09-17', 'personal', '2026-05-12 12:21:23'),
(6, 2, 'August 25, 2025 – September 25, 2025', '2025-10-05', 3000.00, 0.00, 0.00, '2025-10-14', 'personal', '2026-05-12 12:21:23'),
(7, 2, 'September 25, 2025 – October 25, 2025', '2025-11-05', 3000.00, 0.00, 0.00, '2025-11-18', 'personal', '2026-05-12 12:21:23'),
(8, 2, 'October 25, 2025 – November 25, 2025', '2025-12-05', 3000.00, 0.00, 0.00, '2025-12-12', 'personal', '2026-05-12 12:21:23'),
(9, 2, 'November 25, 2025 – December 25, 2025', '2026-01-05', 3000.00, 0.00, 0.00, '2026-01-17', 'personal', '2026-05-12 12:21:23'),
(10, 2, 'December 25, 2025 – January 25, 2026', '2026-02-05', 3000.00, 0.00, 0.00, '2026-02-15', 'personal', '2026-05-12 12:21:23'),
(11, 2, 'January 25, 2026 – February 25, 2026', '2026-03-05', 3000.00, 0.00, 0.00, '2026-03-16', 'personal', '2026-05-12 12:21:23'),
(12, 2, 'February 25, 2026 – March 25, 2026', '2026-04-05', 3000.00, 0.00, 0.00, '2026-04-15', 'personal', '2026-05-12 12:21:23'),
(13, 2, 'March 25, 2026 – April 25, 2026', '2026-05-05', 3000.00, 0.00, 0.00, NULL, 'personal', '2026-05-12 12:21:23'),
(18, 4, 'April 25, 2026 – May 25, 2026', '2026-06-05', 3000.00, 0.00, 0.00, '2026-06-03', 'demo', '2026-05-13 02:12:03'),
(19, 5, 'April 25, 2026 – May 25, 2026', '2026-06-05', 3500.00, 500.00, 0.00, NULL, 'demo', '2026-05-13 02:12:03'),
(20, 6, 'April 25, 2026 – May 25, 2026', '2026-06-05', 4000.00, 0.00, 0.00, NULL, 'demo', '2026-05-13 02:12:03'),
(21, 5, 'May 25, 2026 – June 25, 2026', '2026-07-05', 3500.00, 0.00, 0.00, NULL, 'demo', '2026-05-13 02:12:03');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `room_no` varchar(20) NOT NULL,
  `monthly_rent` decimal(10,2) NOT NULL DEFAULT 3000.00,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `data_scope` enum('demo','personal') DEFAULT 'demo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `name`, `room_no`, `monthly_rent`, `status`, `data_scope`, `created_at`) VALUES
(2, 'Hazie Carra De Guzman', '2', 3000.00, 'active', 'personal', '2026-05-12 10:22:32'),
(4, 'Test Tenant Paid', '101', 3000.00, 'active', 'demo', '2026-05-13 02:12:03'),
(5, 'Test Tenant Partial', '102', 3500.00, 'active', 'demo', '2026-05-13 02:12:03'),
(6, 'Test Tenant Unpaid', '103', 4000.00, 'active', 'demo', '2026-05-13 02:12:03');

-- --------------------------------------------------------

--
-- Table structure for table `utility_bills`
--

CREATE TABLE `utility_bills` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `billing_date` date NOT NULL,
  `billing_period` varchar(100) NOT NULL,
  `due_date` date NOT NULL,
  `previous_water_reading` decimal(10,4) NOT NULL,
  `current_water_reading` decimal(10,4) NOT NULL,
  `water_rate` decimal(10,2) NOT NULL,
  `previous_electric_reading` decimal(10,4) NOT NULL,
  `current_electric_reading` decimal(10,4) NOT NULL,
  `electric_rate` decimal(10,2) NOT NULL,
  `additional_charges` decimal(10,2) NOT NULL DEFAULT 0.00,
  `previous_unpaid_balance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `electric_paid_date` date DEFAULT NULL,
  `water_paid_date` date DEFAULT NULL,
  `data_scope` enum('demo','personal') DEFAULT 'demo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `utility_bills`
--

INSERT INTO `utility_bills` (`id`, `tenant_id`, `billing_date`, `billing_period`, `due_date`, `previous_water_reading`, `current_water_reading`, `water_rate`, `previous_electric_reading`, `current_electric_reading`, `electric_rate`, `additional_charges`, `previous_unpaid_balance`, `amount_paid`, `electric_paid_date`, `water_paid_date`, `data_scope`, `created_at`) VALUES
(5, 2, '2025-08-25', 'July 25, 2025 – August 25, 2025', '2025-09-02', 0.0000, 8.2160, 42.60, 0.0000, 41.2500, 16.00, 0.00, 0.00, 0.00, '2025-09-17', '2025-09-30', 'personal', '2026-05-12 12:21:23'),
(6, 2, '2025-09-25', 'August 25, 2025 – September 25, 2025', '2025-10-02', 8.2160, 17.6056, 42.60, 41.2500, 90.8750, 16.00, 0.00, 0.00, 0.00, '2025-11-01', '2025-10-23', 'personal', '2026-05-12 12:21:23'),
(7, 2, '2025-10-25', 'September 25, 2025 – October 25, 2025', '2025-11-02', 17.6056, 26.3754, 42.60, 90.8750, 152.3281, 16.00, 0.00, 0.00, 0.00, '2025-11-28', '2025-11-28', 'personal', '2026-05-12 12:21:23'),
(8, 2, '2025-11-25', 'October 25, 2025 – November 25, 2025', '2025-12-02', 26.3754, 35.5911, 42.60, 152.3281, 193.5125, 16.00, 0.00, 0.00, 0.00, '2025-12-28', '2025-12-28', 'personal', '2026-05-12 12:21:23'),
(9, 2, '2025-12-25', 'November 25, 2025 – December 25, 2025', '2026-01-02', 35.5911, 45.1216, 42.60, 193.5125, 246.8250, 16.00, 0.00, 0.00, 0.00, '2026-02-02', '2026-02-02', 'personal', '2026-05-12 12:21:23'),
(10, 2, '2026-01-25', 'December 25, 2025 – January 25, 2026', '2026-02-02', 45.1216, 54.6653, 42.60, 246.8250, 294.0750, 16.00, 0.00, 0.00, 0.00, '2026-03-01', '2026-03-01', 'personal', '2026-05-12 12:21:23'),
(11, 2, '2026-02-25', 'January 25, 2026 – February 25, 2026', '2026-03-02', 54.6653, 61.9991, 42.60, 294.0750, 331.1750, 16.00, 0.00, 0.00, 0.00, '2026-03-28', '2026-03-28', 'personal', '2026-05-12 12:21:23'),
(12, 2, '2026-03-25', 'February 25, 2026 – March 25, 2026', '2026-04-02', 61.9991, 71.0991, 42.60, 331.1750, 380.6750, 16.00, 0.00, 0.00, 0.00, '2026-05-01', '2026-03-28', 'personal', '2026-05-12 12:21:23'),
(13, 2, '2026-04-25', 'March 25, 2026 – April 25, 2026', '2026-05-02', 71.0991, 75.7939, 42.60, 380.6750, 437.9438, 16.00, 0.00, 0.00, 0.00, NULL, '2026-05-01', 'personal', '2026-05-12 12:21:23'),
(18, 4, '2026-05-25', 'April 25, 2026 – May 25, 2026', '2026-06-02', 100.0000, 108.0000, 55.00, 500.0000, 560.0000, 2.00, 0.00, 0.00, 0.00, '2026-06-01', '2026-06-01', 'demo', '2026-05-13 02:12:03'),
(19, 5, '2026-05-25', 'April 25, 2026 – May 25, 2026', '2026-06-02', 200.0000, 215.0000, 55.00, 800.0000, 920.0000, 2.00, 150.00, 100.00, 0.00, NULL, NULL, 'demo', '2026-05-13 02:12:03'),
(20, 6, '2026-05-25', 'April 25, 2026 – May 25, 2026', '2026-06-02', 50.0000, 62.0000, 55.00, 300.0000, 390.0000, 2.00, 0.00, 0.00, 0.00, NULL, NULL, 'demo', '2026-05-13 02:12:03'),
(21, 5, '2026-06-25', 'May 25, 2026 – June 25, 2026', '2026-07-02', 215.0000, 223.0000, 55.00, 920.0000, 995.0000, 2.00, 0.00, 0.00, 0.00, NULL, '2026-07-01', 'demo', '2026-05-13 02:12:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `billing_settings`
--
ALTER TABLE `billing_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `calendar_dates`
--
ALTER TABLE `calendar_dates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `full_date` (`full_date`),
  ADD UNIQUE KEY `date_key` (`date_key`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `rent_bills`
--
ALTER TABLE `rent_bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `utility_bills`
--
ALTER TABLE `utility_bills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tenant_id` (`tenant_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `billing_settings`
--
ALTER TABLE `billing_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `calendar_dates`
--
ALTER TABLE `calendar_dates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `rent_bills`
--
ALTER TABLE `rent_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `utility_bills`
--
ALTER TABLE `utility_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rent_bills`
--
ALTER TABLE `rent_bills`
  ADD CONSTRAINT `rent_bills_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `utility_bills`
--
ALTER TABLE `utility_bills`
  ADD CONSTRAINT `utility_bills_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
