-- +goose Up


CREATE TABLE `hotel_type_rooms` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `free_cancel` bool DEFAULT 0,
  `how_long_to_cancel` int DEFAULT 0,
  `refundable` bool DEFAULT 0,
  `room_size` smallint DEFAULT 0,
  `bed_type` ENUM ('single_bed', 'double_bed', 'twin_bed', 'queen_bed', 'king_bed') DEFAULT 'single_bed',
  `max_adult` smallint DEFAULT 1,
  `max_children` smallint DEFAULT 1,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_type_room_price_period` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_type_room` int,
  `name` varchar(120) NOT NULL,
  `start_at` bigint NOT NULL,
  `end_at` bigint NOT NULL,
  `status` ENUM ('active', 'unactive', 'expired') DEFAULT 'active',
  `default` bool DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_type_room_dynamic_price` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_price_period` int,
  `price_per_night` decimal(10,2) NOT NULL,
  `price_per_two_night` decimal(10,2) NOT NULL,
  `price_long_stay` decimal(10,2) NOT NULL,
  `category` ENUM ('sunday', 'monday', 'thursday', 'wednesday', 'thuesday', 'friday', 'saturday', 'all_day') DEFAULT 'all_day',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_type_room_images` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_type_room` int NOT NULL,
  `url` varchar(255) NOT NULL,
  `isPinned` bool DEFAULT 0,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_rooms` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_type_room` int NOT NULL,
  `name` varchar(60) NOT NULL,
  `description` text,
  `telp` varchar(28),
  `status` ENUM ('available', 'not_available', 'cleaning', 'maintenance', 'filled') NOT NULL DEFAULT 'available',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_type_room_benefit` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_type_room` int NOT NULL,
  `name` varchar(120),
  `category` ENUM ('free', 'allowed') DEFAULT 'allowed',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_type_room_rules` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_type_room` int NOT NULL,
  `name` varchar(120),
  `category` ENUM ('allowed', 'forbidden') DEFAULT 'allowed',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);


CREATE TABLE `voucher_hotel_type_rooms` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_voucher` int,
  `id_hotel_type_room` int,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_room_bookings` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel_room` int,
  `check_in_at` bigint NOT NULL,
  `check_out_at` bigint NOT NULL,
  `status` ENUM ( 'pending', 'completed', 'cancelled' ) DEFAULT 'cancelled',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);



-- +goose Down
DROP TABLE IF EXISTS hotel_room_bookings;
DROP TABLE IF EXISTS voucher_hotel_type_rooms;
DROP TABLE IF EXISTS hotel_type_room_rules;
DROP TABLE IF EXISTS hotel_type_room_benefit;
DROP TABLE IF EXISTS hotel_rooms;
DROP TABLE IF EXISTS hotel_type_room_images;
DROP TABLE IF EXISTS hotel_type_room_dynamic_price;
DROP TABLE IF EXISTS hotel_type_room_price_period;
DROP TABLE IF EXISTS hotel_type_rooms;

