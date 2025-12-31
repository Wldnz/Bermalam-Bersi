-- +goose Up


CREATE TABLE `category_facilities` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(60) NOT NULL,
  `description` text,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `facilities` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_category_facility` int NOT NULL,
  `name` varchar(60) NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `hotel_facilities` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_facilities` int NOT NULL,
  `id_hotel` int,
  `id_type_room` int DEFAULT null,
  `category` ENUM ('hotel', 'room', 'public') DEFAULT 'hotel',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);


-- +goose Down

DROP TABLE IF EXISTS hotel_facilities;
DROP TABLE IF EXISTS facilities;
DROP TABLE IF EXISTS hotel_facilities;

