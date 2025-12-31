-- +goose Up
-- 6. SEED VOUCHERS
INSERT INTO `vouchers` (`name`, `description`, `stock`, `max_exchange`, `category`, `poin_exchange`, `expired_at`, `created_at`, `updated_at`, `created_by`) VALUES 
('DISKON AWAL TAHUN', 'Potongan harga langsung untuk pengguna baru', 100, 1, 'discount', 0, 1735689600000, 1704067200000, 1704067200000, 1);

-- +goose Down
DELETE FROM `vouchers`;
