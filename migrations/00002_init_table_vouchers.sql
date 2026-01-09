-- +goose Up

CREATE TABLE `vouchers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(265) NOT NULL,
  `description` text NOT NULL,
  `stock` int NOT NULL,
  `max_exchange` int NOT NULL,
  `category` ENUM ('discount', 'cashback', 'free_stuff') DEFAULT 'discount',
  `poin_exchange` int DEFAULT 0,
  `permisson` bool DEFAULT 1,
  `discount`  decimal(3,1) DEFAULT 0,
  `cashback` int DEFAULT 0,
  `expired_at` bigint NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);

CREATE TABLE `user_vouchers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_user` int,
  `status` ENUM ('active', 'inactive', 'expired') DEFAULT 'active',
  `expired_at` bigint NOT NULL,
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);



-- +goose Down

DROP TABLE IF EXISTS user_vouchers;
DROP TABLE IF EXISTS vouchers;

