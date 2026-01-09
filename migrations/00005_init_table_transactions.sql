-- +goose Up

CREATE TABLE `transactions` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `total_price` decimal(10,2) NOT NULL,
  `tax_cost` decimal(10,2) NOT NULL,
  `total_rooms` int(2) NOT NULL,
  `adult` int(2) NOT NULL,
  `children` int(2) NOT NULL,
  `check_in` bigint NOT NULL,
  `check_out` bigint NOT NULL,
  `category` ENUM ('dp', 'full') DEFAULT 'full',
  `level` ENUM ('night', 'two_night', 'long_stay') DEFAULT 'night',
  `payment_type` varchar(60),
  `payment_link` varchar(255) NOT NULL,
  `status` ENUM ('pending', 'paid', 'success', 'fail', 'cancelled' ,'request_refund') DEFAULT 'pending',
  `expired_at` bigint NOT NULL,
  `created_at` bigint,
  `updated_at` bigint,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `booking` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_transaction` int NOT NULL,
  `id_type_room` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `check_in_at` bigint,
  `check_out_at` bigint NOT NULL,
  `note` text NOT NULL,
  `person_name` varchar(120) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `phone_country_code` smallint NOT NULL,
  `hasWhatsApp` bool DEFAULT 0,
  `status` ENUM ('pending', 'check_in', 'check_out', 'refund_half', 'refund_all') DEFAULT 'pending',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `request_refund_transaction` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_transaction` int,
  `status` ENUM ('pending', 'accepted_hotel', 'rejected_hotel', 'accepted_application', 'rejected_application') DEFAULT 'pending',
  `reason` text NOT NULL,
  `reason_hotel` text NOT NULL,
  `reason_application` text NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `other_bills` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_booking` int,
  `name` varchar(120) NOT NULL,
  `total_must_paid` decimal(10,2) NOT NULL,
  `category` ENUM ('low', 'mid', 'heavy') DEFAULT 'low',
  `status` ENUM ('unpaid', 'paid') DEFAULT 'unpaid',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `transaction_vouchers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user_voucher` int,
  `id_transaction` int,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_feedback` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_transaction` int NOT NULL,
  `guest_name` varchar(255),
  `value` text NOT NULL,
  `category` ENUM ('not_specified', 'neutral', 'positive', 'negative') DEFAULT 'not_specified',
  `stars` decimal(2,1) NOT NULL DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);



-- +goose Down

DROP TABLE IF EXISTS hotel_feedback;
DROP TABLE IF EXISTS transaction_vouchers;
DROP TABLE IF EXISTS other_bills;
DROP TABLE IF EXISTS request_refund_transaction;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS transactions;

