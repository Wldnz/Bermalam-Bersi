-- +goose Up
    INSERT INTO transactions(
        `id_user`, `total_price`, `tax_cost`, `total_rooms`, `adult`, `children`, `check_in`, `check_out`, `category`, `level`, `payment_type`, `status`, `expired_at`, `created_at`, `updated_at`, `created_by`, `updated_by`
    ) VALUES 
    
    ( 3, 1200000, 5.5, 1, 2, 1, 1737534223000, 1737534223000, 'full', 'night', 'gopay', 'paid', 1737534223000, 1737447823000, 1737447823000, 3, 3);

    INSERT INTO booking(
        `id_transaction`, `id_type_room`, `price`, `check_in_at`, `check_out_at`, `person_name`, `phone_local`, `phone_country_code`, `hasWhatsApp`, `status`, `note`, `created_at`, `updated_at`, `created_by`, `updated_by`
    ) VALUES

    ( 1, 1, 1200000, 1737534223000, 1737534223000, 'Wildan', 812121212, 62, 1, 'check_out', 'Bang Kamar Yang Gak Berisik ya!', 1737534223000, 1737534223000, 3, 3 );


-- +goose Down
DELETE FROM `booking`;
DELETE FROM `transactions`;
