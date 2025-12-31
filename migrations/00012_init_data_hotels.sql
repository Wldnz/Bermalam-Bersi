-- +goose Up

-- Hotel 1 (Owner ID: 9 - Wildan Owner)
INSERT INTO hotels (
    `id_user`, `name`, `description`, `email`, `phone`, `property_type`, 
    `operational_check_in_at`, `operational_check_out_at`, `stars`, 
    `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES 
(
    4, 
    'Hotel AmanKila Luxury', 
    'Properti ini memiliki tingkat kenyamanan yang luar biasa, segera pesan kamar sekarang sebelum kehabisan stok!', 
    'support@amanKila.id', 
    '81234567890', 
    'hotel', 
    50400000, -- Jam 14:00 (dalam milidetik dari 00:00)
    43200000, -- Jam 12:00
    5, 
    1704067200000, 1704067200000, 4, 4
),

(
    5, 
    'Villa Luxury Welienburg', 
    'Properti ini memiliki tingkat kenyamanan yang luar biasa, segera pesan kamar sekarang sebelum kehabisan stok!', 
    'support@welienburg.id', 
    '81234567890', 
    'villa', 
    50400000, -- Jam 14:00 (dalam milidetik dari 00:00)
    43200000, -- Jam 12:00
    5, 
    1704067200000, 1704067200000, 5, 5
);

INSERT INTO hotel_images (`id_hotel`, `url`, `created_at`, `updated_at`, `created_by`, `updated_by`)
VALUES 

( 1, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/db/69/69/amankila-three-tiered.jpg?w=900&h=500&s=1', 1704067200000, 1704067200000, 4, 4 ),

( 2, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/db/69/69/amankila-three-tiered.jpg?w=900&h=500&s=1', 1704067200000, 1704067200000, 5, 5 ),

( 1, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/db/69/69/amankila-three-tiered.jpg?w=900&h=500&s=1', 1704067200000, 1704067200000, 4, 4 );

INSERT INTO hotel_facilities( `id_facilities`, `id_hotel`, `category`, `created_at`, `updated_at`, `created_by`, `updated_by` )

    VALUES  ( 1, 1, 'hotel', 1737447823000, 1737447823000, 1, 1  );

INSERT INTO hotel_type_rooms(
    `id_hotel`, `name`, `description`, `free_cancel`, `how_long_to_cancel`, `refundable`, `room_size`, `bed_type`, `max_adult`, `max_children`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 'Luxury Room', 'Luxury Room Adalah Kamar Yang...', 1, 1800000, 0, 57, 'single_bed', 2, 1, 1737620623000, 1737620623000, 4, 4 );

INSERT INTO hotel_type_room_images(
    `id_type_room`, `url`, `isPinned`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, '', 1, 1737620623000, 1737620623000, 4, 4 );

INSERT INTO hotel_rooms(
    `id_type_room`, `name`, `description`, `telp`, `status`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 'A001', '-', 121212112, 'available', 1737620623000, 1737620623000, 4, 4 );

INSERT INTO hotel_type_room_price_period(
    `id_type_room`, `name`, `start_at`, `end_at`, `status`, `default`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 'Default Price', 1737620623000, 1737620623000, 'active', 1, 1737620623000, 1737620623000, 4, 4 );

INSERT INTO hotel_type_room_dynamic_price(
    `id_price_period`, `price_per_night`, `price_per_two_night`, `price_long_stay`, `category`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 1200000, 1000000, 900000, 'all_day', 1737620623000, 1737620623000, 4, 4 );




-- +goose Down
DELETE FROM `hotel_type_room_dynamic_price`;
DELETE FROM `hotel_type_room_price_period`;
DELETE FROM `hotel_rooms`
DELETE FROM `hotel_type_room_images`;
DELETE FROM `hotel_type_rooms`;
DELETE FROM `hotel_facilities`;
DELETE FROM `hotel_images`;
DELETE FROM `hotels`;