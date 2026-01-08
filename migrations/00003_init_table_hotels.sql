-- +goose Up

CREATE TABLE `hotels` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(12) NOT NULL,
  `property_type` ENUM ('villa', 'hotel', 'apartment') DEFAULT 'hotel',
  `operational_check_in_at` bigint NOT NULL,
  `operational_check_out_at` bigint NOT NULL,
  `stars` decimal(2,1) NOT NULL DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_images` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int,
  `url` varchar(265),
  `isPinned` bool DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_location` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int,
  `address_1` varchar(255) NOT NULL,
  `address_2` varchar(255) NOT NULL,
  `zip_code` varchar(25) NOT NULL,
  `country` varchar(120) NOT NULL,
  `province` varchar(120) NOT NULL,
  `city` varchar(120) NOT NULL,
  `longitude` decimal(10,8) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `detail_hotel` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int NOT NULL,
  `npwp_number` varchar(16) NOT NULL,
  `bank_name` varchar(255) NOT NULL,
  `bank_account` varchar(255) NOT NULL COMMENT 'just like nomor rekening',
  `bank_account_owned_by` varchar(255) NOT NULL,
  `status` ENUM ('unverified', 'pending', 'verified') DEFAULT 'unverified',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_operational` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int NOT NULL,
  `position_charge` varchar(60) NOT NULL,
  `reason_using` text NOT NULL,
  `haveExperience` smallint DEFAULT 0,
  `previousManageIsAlone` smallint DEFAULT 0,
  `acceptFreeCancelled` smallint DEFAULT 0,
  `howLongAcceptCancelled` bigint DEFAULT 0 COMMENT 'shold be timestamp and the timestamp is 12 hour or somethin',
  `acceptRefund` smallint DEFAULT 0,
  `requirement_refund` ENUM ('nothing', 'dp', 'full_paid') DEFAULT 'nothing',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_documents` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int NOT NULL,
  `document_url` varchar(265),
  `reason` text NOT NULL,
  `verified` bool DEFAULT 0,
  `status` ENUM ('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `sanctions` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(30) UNIQUE NOT NULL,
  `name` varchar(255) UNIQUE NOT NULL COMMENT 'seperti : not_allowed_take_guest',
  `description` text NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_sanctions` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int NOT NULL,
  `id_sanction` int NOT NULL,
  `reason` text NOT NULL,
  `category` ENUM ('light', 'intermediate', 'heavy') DEFAULT 'light',
  `expired_at` bigint NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_receptionists`(
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `id_hotel` int NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);




-- +goose Down

DROP TABLE IF EXISTS hotel_receptionists;
DROP TABLE IF EXISTS hotel_sanctions;
DROP TABLE IF EXISTS sanctions;
DROP TABLE IF EXISTS hotel_documents;
DROP TABLE IF EXISTS hotel_operational;
DROP TABLE IF EXISTS detail_hotel;
DROP TABLE IF EXISTS hotel_location;
DROP TABLE IF EXISTS hotel_images;
DROP TABLE IF EXISTS hotels;

