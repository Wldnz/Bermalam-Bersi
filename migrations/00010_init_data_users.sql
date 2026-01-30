-- +goose Up

-- password $2a$10$rlQTrfOR0hZPoNzQee8S2elewK7fqkA4reuwfE4UxDcusJfeJF8wG (,US-?eh2Rx5n)~f)

-- akun yang tidak verified yaw!

INSERT INTO users(`first_name`, `last_name`, `email`, `phone`, `phone_country_code`, `password`, `role`, `status`, `created_at`, `updated_at`) 

VALUES 

('Wildan', 'Izhar Al Haqq', 'wildanizharalhaqq@gmail.com', 81234567890, 62, '$2a$10$rlQTrfOR0hZPoNzQee8S2elewK7fqkA4reuwfE4UxDcusJfeJF8wG', 'administration', 'active', 1735633423000, 1735633423000),

('William', 'Afton', 'williamafton@example.com', 81234567890, 62, '$2a$10$rlQTrfOR0hZPoNzQee8S2elewK7fqkA4reuwfE4UxDcusJfeJF8wG', 'receptionist', 'active', 1753691023000, 1753691023000),

('Wildan', 'Tamu', 'wildanofficial32@gmail.com', 81234567890, 62, '$2a$10$rlQTrfOR0hZPoNzQee8S2elewK7fqkA4reuwfE4UxDcusJfeJF8wG', 'guest', 'active', 1753691023000, 1753691023000),

('Waladan', 'Cuy', 'wildanofficial778@gmail.com', 81234567890, 62, '$2a$10$rlQTrfOR0hZPoNzQee8S2elewK7fqkA4reuwfE4UxDcusJfeJF8wG', 'hotel_owner', 'active', 1751099023000, 1751099023000);

INSERT INTO users(`first_name`, `last_name`, `email`, `phone`, `phone_country_code`, `password`, `role`, `status`, `verified` , `verified_at`, `created_at`, `updated_at`) 

VALUES

('Hiu', 'Putih', 'hiuputih@gmail.com', 81234567890, 62, '$2a$10$rlQTrfOR0hZPoNzQee8S2elewK7fqkA4reuwfE4UxDcusJfeJF8wG', 'hotel_owner', 'active', 1, 1756369423000, 1756369423000, 1756369423000);

INSERT INTO user_images (`id_user`, `url`, `created_at`, `updated_at`, `created_by`, `updated_by`)

VALUES

( 1, 'https://media.licdn.com/dms/image/v2/D4D03AQG6iWXDOjyrdg/profile-displayphoto-shrink_200_200/B4DZSCraniG4AY-/0/1737359209953?e=2147483647&v=beta&t=M08nCi6PjReKmjoS5VDN0dWRvTaS-wb8yC6A6qIwEUo', 1755764623000, 1755764623000, 1, 1);

-- +goose Down
DELETE FROM `user_images`;
DELETE FROM `users`;

