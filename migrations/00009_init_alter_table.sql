-- +goose Up
-- Bagian ini menambahkan semua relasi antar tabel

-- Relasi Tabel Users (Self-Reference)
ALTER TABLE `users` ADD FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);
ALTER TABLE `users` ADD FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`);

-- Relasi Profil User
ALTER TABLE `user_address` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);
ALTER TABLE `user_identification` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);
ALTER TABLE `user_images` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

-- Relasi Auth & Session
ALTER TABLE `auth_token` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);
ALTER TABLE `session` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

-- Relasi Hotel & Fasilitas
ALTER TABLE `hotels` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);
ALTER TABLE `hotel_images` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `facilities` ADD FOREIGN KEY (`id_category_facility`) REFERENCES `category_facilities` (`id`);
ALTER TABLE `hotel_facilities` ADD FOREIGN KEY (`id_facilities`) REFERENCES `facilities` (`id`);
ALTER TABLE `hotel_facilities` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `hotel_location` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `detail_hotel` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `hotel_operational` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `hotel_documents` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);

-- Relasi Kamar (Rooms)
ALTER TABLE `hotel_type_rooms` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `hotel_type_room_price_period` ADD FOREIGN KEY (`id_type_room`) REFERENCES `hotel_type_rooms` (`id`);
ALTER TABLE `hotel_type_room_benefit` ADD FOREIGN KEY (`id_type_room`) REFERENCES `hotel_type_rooms` (`id`);
ALTER TABLE `hotel_type_room_rules` ADD FOREIGN KEY (`id_type_room`) REFERENCES `hotel_type_rooms` (`id`);
ALTER TABLE `hotel_type_room_dynamic_price` ADD FOREIGN KEY (`id_price_period`) REFERENCES `hotel_type_room_price_period` (`id`);
ALTER TABLE `hotel_type_room_images` ADD FOREIGN KEY (`id_type_room`) REFERENCES `hotel_type_rooms` (`id`);
ALTER TABLE `hotel_rooms` ADD FOREIGN KEY (`id_type_room`) REFERENCES `hotel_type_rooms` (`id`);

-- Relasi Transaksi & Booking
ALTER TABLE `transactions` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);
ALTER TABLE `transaction_doku_informations` ADD FOREIGN KEY (`id_transaction`) REFERENCES `transactions` (`id`);
ALTER TABLE `booking` ADD FOREIGN KEY (`id_transaction`) REFERENCES `transactions` (`id`);
ALTER TABLE `booking` ADD FOREIGN KEY (`id_type_room`) REFERENCES `hotel_type_rooms` (`id`);
ALTER TABLE `other_bills` ADD FOREIGN KEY (`id_booking`) REFERENCES `transactions` (`id`);
ALTER TABLE `request_refund_transaction` ADD FOREIGN KEY (`id_transaction`) REFERENCES `transactions` (`id`);

-- Relasi Voucher
ALTER TABLE `user_vouchers` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);
ALTER TABLE `user_vouchers` ADD FOREIGN KEY (`id_voucher`) REFERENCES `vouchers` (`id`);
ALTER TABLE `transaction_vouchers` ADD FOREIGN KEY (`id_user_voucher`) REFERENCES `user_vouchers` (`id`);
ALTER TABLE `transaction_vouchers` ADD FOREIGN KEY (`id_transaction`) REFERENCES `transactions` (`id`);
ALTER TABLE `voucher_hotel_type_rooms` ADD FOREIGN KEY (`id_voucher`) REFERENCES `vouchers` (`id`);
ALTER TABLE `voucher_hotel_type_rooms` ADD FOREIGN KEY (`id_hotel_type_room`) REFERENCES `hotel_type_rooms` (`id`);

-- Relasi Fitur Tambahan (Sanction, FAQ, Feedback, Missing Stuffs)
ALTER TABLE `hotel_receptionists` ADD FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);
ALTER TABLE `hotel_receptionists` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `hotel_sanctions` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `hotel_sanctions` ADD FOREIGN KEY (`id_sanction`) REFERENCES `sanctions` (`id`);
ALTER TABLE `hotel_feedback` ADD FOREIGN KEY (`id_transaction`) REFERENCES `transactions` (`id`);
ALTER TABLE `faqs` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `missing_stuffs` ADD FOREIGN KEY (`id_hotel`) REFERENCES `hotels` (`id`);
ALTER TABLE `missing_stuff_images` ADD FOREIGN KEY (`id_missing_stuff`) REFERENCES `missing_stuffs` (`id`);

-- +goose Down
-- Mematikan pengecekan agar proses penghapusan FK berjalan lancar
SET FOREIGN_KEY_CHECKS = 0;

-- Menghapus relasi satu per satu (Hanya contoh beberapa, lakukan untuk semua tabel)
ALTER TABLE `missing_stuff_images` DROP FOREIGN KEY `missing_stuff_images_ibfk_1`;
ALTER TABLE `missing_stuffs` DROP FOREIGN KEY `missing_stuffs_ibfk_1`;
ALTER TABLE `faqs` DROP FOREIGN KEY `faqs_ibfk_1`;
ALTER TABLE `hotel_feedback` DROP FOREIGN KEY `hotel_feedback_ibfk_1`;
ALTER TABLE `hotel_sanctions` DROP FOREIGN KEY `hotel_sanctions_ibfk_1`;
ALTER TABLE `hotel_sanctions` DROP FOREIGN KEY `hotel_sanctions_ibfk_2`;
ALTER TABLE `hotel_receptionists` DROP FOREIGN KEY `hotel_sanctions_ibfk_1`;
ALTER TABLE `hotel_receptionists` DROP FOREIGN KEY (`hotel_sanctions_ibfk_1`;
ALTER TABLE `voucher_hotel_type_rooms` DROP FOREIGN KEY `voucher_hotel_type_rooms_ibfk_1`;
ALTER TABLE `voucher_hotel_type_rooms` DROP FOREIGN KEY `voucher_hotel_type_rooms_ibfk_2`;
ALTER TABLE `transaction_vouchers` DROP FOREIGN KEY `transaction_vouchers_ibfk_1`;
ALTER TABLE `transaction_vouchers` DROP FOREIGN KEY `transaction_vouchers_ibfk_2`;
ALTER TABLE `user_vouchers` DROP FOREIGN KEY `user_vouchers_ibfk_1`;
ALTER TABLE `user_vouchers` DROP FOREIGN KEY `user_vouchers_ibfk_2`;
ALTER TABLE `request_refund_transaction` DROP FOREIGN KEY `request_refund_transaction_ibfk_1`;
ALTER TABLE `other_bills` DROP FOREIGN KEY `other_bills_ibfk_1`;
ALTER TABLE `transaction_doku_informations` DROP FOREIGN KEY `transaction_doku_informations_ibfk_1`;
ALTER TABLE `booking` DROP FOREIGN KEY `booking_ibfk_1`;
ALTER TABLE `booking` DROP FOREIGN KEY `booking_ibfk_2`;
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_ibfk_1`;
ALTER TABLE `hotel_rooms` DROP FOREIGN KEY `hotel_rooms_ibfk_1`;
ALTER TABLE `hotel_type_room_images` DROP FOREIGN KEY `hotel_type_room_images_ibfk_1`;
ALTER TABLE `hotel_type_room_dynamic_price` DROP FOREIGN KEY `hotel_type_room_dynamic_price_ibfk_1`;
ALTER TABLE `hotel_type_room_price_period` DROP FOREIGN KEY `hotel_type_room_price_period_ibfk_1`;
ALTER TABLE `hotel_type_room_benefit` DROP FOREIGN KEY `hotel_type_room_benefit_ibfk_1`;
ALTER TABLE `hotel_type_room_rules` DROP FOREIGN KEY `hotel_type_room_rules_ibfk_1`;
ALTER TABLE `hotel_type_rooms` DROP FOREIGN KEY `hotel_type_rooms_ibfk_1`;
ALTER TABLE `hotel_documents` DROP FOREIGN KEY `hotel_documents_ibfk_1`;
ALTER TABLE `detail_hotel` DROP FOREIGN KEY `detail_hotel_ibfk_1`;
ALTER TABLE `hotel_operational` DROP FOREIGN KEY `hotel_operational_ibfk_1`;
ALTER TABLE `hotel_location` DROP FOREIGN KEY `hotel_location_ibfk_1`;
ALTER TABLE `hotel_facilities` DROP FOREIGN KEY `hotel_facilities_ibfk_1`;
ALTER TABLE `hotel_facilities` DROP FOREIGN KEY `hotel_facilities_ibfk_2`;
ALTER TABLE `facilities` DROP FOREIGN KEY `facilities_ibfk_1`;
ALTER TABLE `hotel_images` DROP FOREIGN KEY `hotel_images_ibfk_1`;
ALTER TABLE `hotels` DROP FOREIGN KEY `hotels_ibfk_1`;
ALTER TABLE `session` DROP FOREIGN KEY `session_ibfk_1`;
ALTER TABLE `auth_token` DROP FOREIGN KEY `auth_token_ibfk_1`;
ALTER TABLE `user_images` DROP FOREIGN KEY `user_images_ibfk_1`;
ALTER TABLE `user_identification` DROP FOREIGN KEY `user_identification_ibfk_1`;
ALTER TABLE `user_address` DROP FOREIGN KEY `user_address_ibfk_1`;
ALTER TABLE `users` DROP FOREIGN KEY `users_ibfk_1`;
ALTER TABLE `users` DROP FOREIGN KEY `users_ibfk_2`;

SET FOREIGN_KEY_CHECKS = 1;