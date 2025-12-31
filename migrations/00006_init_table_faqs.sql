-- +goose Up

CREATE TABLE `faqs` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_hotel` int COMMENT 'can be null cause it will be genernal (public) or for hotel',
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `category` ENUM ('guest', 'hotel_owner', 'hotel') DEFAULT 'guest',
  `created_at` bigint NOT NULL,
  `updated_at` bigint NOT NULL,
  `created_by` int,
  `updated_by` int
);


-- +goose Down

DROP TABLE IF EXISTS faqs;

