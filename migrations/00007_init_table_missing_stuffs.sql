-- +goose Up

CREATE TABLE `missing_stuffs` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int NOT NULL,
  `name` varchar(120),
  `description` text NOT NULL,
  `found_location` varchar(120),
  `missing_location` varchar(120) NOT NULL,
  `found_at` bigint,
  `missing_at` bigint NOT NULL,
  `received_name` varchar(120),
  `received_email` varchar(120),
  `received_phone` varchar(120),
  `received_at` bigint,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `missing_stuff_images` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_missing_stuff` int,
  `url` varchar(255) NOT NULL,
  `category` ENUM ('stuff', 'the_received') DEFAULT 'stuff'
);


-- +goose Down

DROP TABLE IF EXISTS missing_stuff_images;
DROP TABLE IF EXISTS missing_stuffS;

