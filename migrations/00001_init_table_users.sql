-- +goose Up
CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(60) NOT NULL,
  `last_name` varchar(60) NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `phone` varchar(20) NOT NULL,
  `phone_country_code` smallint NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` ENUM ('guest', 'hotel_owner', 'receptionist', 'administration', 'owner') DEFAULT 'guest',
  `status` ENUM ('unactive', 'active', 'deleted') DEFAULT 'unactive',
  `verified` bool DEFAULT 0,
  `verified_at` bigint,
  `points` int DEFAULT 0,
  `created_by` int,
  `updated_by` int,
  `created_at` bigint,
  `updated_at` bigint
);

CREATE TABLE `user_address` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `address` varchar(265) NOT NULL,
  `country` varchar(80) NOT NULL,
  `city` varchar(120) NOT NULL,
  `zip_code` varchar(10) NOT NULL,
  `created_at` bigint,
  `updated_at` bigint,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `user_identification` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `document_url` varchar(255),
  `status` ENUM ('pending', 'accepted', 'rejected') DEFAULT 'pending',
  `reason` text,
  `created_at` bigint,
  `updated_at` bigint,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `user_images` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `url` varchar(265) NOT NULL,
  `created_at` bigint,
  `updated_at` bigint,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `auth_token` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `token` varchar(265) NOT NULL,
  `expired_at` bigint NOT NULL,
  `used` bool NOT NULL,
  `category` ENUM ('activate', 'change_password') DEFAULT 'change_password',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `session` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `code_otp` smallint NOT NULL,
  `token` varchar(265) NOT NULL,
  `active` bool NOT NULL DEFAULT 0,
  `is_remember` bool NOT NULL DEFAULT 0,
  `expired_at` bigint NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL
);

-- +goose Down
DROP TABLE IF EXISTS user_images;

DROP TABLE IF EXISTS user_address;

DROP TABLE IF EXISTS user_identification;

DROP TABLE IF EXISTS auth_token;

DROP TABLE IF EXISTS `session`;

DROP TABLE IF EXISTS users;
