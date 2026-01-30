-- +goose Up
-- 6. SEED VOUCHERS
INSERT INTO `vouchers` (`name`, `description`, `stock`, `max_exchange`, `category`, `poin_exchange`, `discount`, `cashback`,`expired_at`, `created_at`, `updated_at`, `created_by`) 

VALUES 
('Diskon Awal Tahun', 'Potongan harga langsung untuk pengguna baru', 100, 1, 'discount', 0, 0 , 100000 ,1735689600000, 1704067200000, 1704067200000, 1),
('Potongan Harga Hingga 200 Ribu', 'Potongan harga langsung untuk pengguna baru sebesar 200 Ribu!', 10, 1, 'cashback', 0, 0 , 200000, 1856049054158, 1704067200000, 1704067200000, 1),
('Diskon 3%', 'Diskon 3% Untuk Kamu Yang Baru Terdaftar', 10, 1, 'discount', 0, 3 , 0 , 1856049054158, 1704067200000, 1704067200000, 1);

INSERT INTO `user_vouchers` ( `id_user`, `status`, `expired_at`, `created_at`, `updated_at`, `created_by`, `updated_by` )
VALUES ( 2, 'active', 1856049054158, 1704067200000, 1704067200000, 2, 2 );

-- +goose Down
DELETE FROM `user_vouchers`;
DELETE FROM `vouchers`;
