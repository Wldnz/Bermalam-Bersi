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
    'Alila Manggis', 
    'Properti ini memiliki tingkat kenyamanan yang luar biasa, segera pesan kamar sekarang sebelum kehabisan stok!', 
    'support@welienburg.id', 
    '81234567890', 
    'hotel', 
    50400000, -- Jam 14:00 (dalam milidetik dari 00:00)
    43200000, -- Jam 12:00
    5, 
    1704067200000, 1704067200000, 5, 5
),

(
    4, 
    'Hotel AmanKila Luxury VIP', 
    'Properti ini memiliki tingkat kenyamanan yang luar biasa, segera pesan kamar sekarang sebelum kehabisan stok!', 
    'support@amanKila.id', 
    '81234567890', 
    'hotel', 
    50400000, -- Jam 14:00 (dalam milidetik dari 00:00)
    43200000, -- Jam 12:00
    5, 
    1704067200000, 1704067200000, 4, 4
);

-- detail

INSERT INTO `detail_hotel` ( `id_hotel`, `npwp_number`, `bank_name`, `bank_account`, `bank_account_owned_by`, `status`, `created_at`, `updated_at`)
VALUES 
    ( 1, '1234567890', 'BCA', '123451212112', 'Raihan Athvi', 'verified', '1704067200000', '1704067200000'  ),
    ( 2, '1234567891', 'MANDIRI', '123451212122', 'Rizky Harto', 'pending', '1704067200000', '1704067200000'  ),
     ( 3, '1234567881', 'BRI', '123451218122', 'Raditya Pefiye', 'pending', '1704067200000', '1704067200000'  );


-- locaiton

INSERT INTO `hotel_location` ( `id_hotel`, `address_1`, `address_2`, `zip_code`, `country`, `province`, `city`, `longitude`, `latitude`, `created_at`, `updated_at` )
    VALUES 
    ( 1, 'Jl. Raya Manggis, Manggis, Kec. Manggis, Kabupaten Karangasem, Bali 80871', '-', '80871', 'indonesian', 'Bali', 'Karangsem', '-8.500656384502056', '115.5281577404202', 1704067200000, 1704067200000 ),
    ( 2, 'Desa Buitan, Manggis, Karangasem Regency, Bali 80871, Kabupaten Karangasem, Bali 80871', '-', '80871', 'indonesian', 'Bali', 'Karangsem', '-8.49951779547407', '115.5382293130623', 1704067200000, 1704067200000 ),
    ( 3, 'Jl. Tanah Ampo, Manggis, Kec. Manggis, Kabupaten Karangasem, Bali 80871', '-', '80871', 'indonesian', 'Bali', 'Karangsem', '-8.50317814099642', '115.51867116050875', 1704067200000, 1704067200000 );

INSERT INTO hotel_images (`id_hotel`, `url`, `isPinned`,`created_at`, `updated_at`, `created_by`, `updated_by`)
VALUES 

( 1, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/db/69/69/amankila-three-tiered.jpg?w=900&h=500&s=1', 1,1704067200000, 1704067200000, 4, 4 ),

( 2, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/db/69/69/amankila-three-tiered.jpg?w=900&h=500&s=1', 1,1704067200000, 1704067200000, 5, 5 ),

( 3, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/db/69/69/amankila-three-tiered.jpg?w=900&h=500&s=1', 1,1704067200000, 1704067200000, 4, 4 );

INSERT INTO hotel_facilities( `id_facilities`, `id_hotel`, `category`, `created_at`, `updated_at`, `created_by`, `updated_by` )

    VALUES  ( 1, 1, 'hotel', 1737447823000, 1737447823000, 1, 1  );

INSERT INTO hotel_type_rooms(
    `id_hotel`, `name`, `description`, `free_cancel`, `how_long_to_cancel`, `refundable`, `room_size`, `bed_type`, `max_adult`, `max_children`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES 
( 1, 'Luxury Room', 'Luxury Room Adalah Kamar Yang...', 1, 1800000, 0, 57, 'single_bed', 2, 1, 1737620623000, 1737620623000, 4, 4 ),
    ( 2, 'Deluxe Room', 'Deluxe Room adalah kamar yang sangat indah dan cocok untuk kalian yang ingin menggunakannya...', 1, 1800000, 0, 57, 'single_bed', 2, 1, 1737620623000, 1737620623000, 4, 4 ),
    ( 3, 'Luxury Room', 'Luxury Room Adalah Kamar Yang...', 1, 1800000, 0, 57, 'single_bed', 2, 1, 1737620623000, 1737620623000, 4, 4 ),
    ( 1, 'Standart Room', 'Standart Room Adalah kamar yang memiliki fasilitas dan kefungsian yang pas untuk kamu yang ingin mencari tempat bermalam sementara...', 1, 1800000, 0, 57, 'single_bed', 2, 1, 1737620623000, 1737620623000, 4, 4 )
;

INSERT INTO hotel_type_room_images(
    `id_type_room`, `url`, `isPinned`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxmFWkM-k7VQKi8eKxAiPdHtdB4QPfMMeUow&s', 1, 1737620623000, 1737620623000, 4, 4 ),
( 2, 'https://img.freepik.com/free-photo/3d-rendering-beautiful-comtemporary-luxury-bedroom-suite-hotel-with-tv_105762-2058.jpg?semt=ais_hybrid&w=740&q=80', 1, 1737620623000, 1737620623000, 4, 4 ),
( 3, 'https://media.istockphoto.com/id/627892060/photo/hotel-room-suite-with-view.jpg?s=612x612&w=0&k=20&c=YBwxnGH3MkOLLpBKCvWAD8F__T-ypznRUJ_N13Zb1cU=', 1, 1737620623000, 1737620623000, 4, 4 ),
( 4, 'https://media.istockphoto.com/id/627892060/photo/hotel-room-suite-with-view.jpg?s=612x612&w=0&k=20&c=YBwxnGH3MkOLLpBKCvWAD8F__T-ypznRUJ_N13Zb1cU=', 1, 1737620623000, 1737620623000, 4, 4 ),
( 4, 'https://media.istockphoto.com/id/627892060/photo/hotel-room-suite-with-view.jpg?s=612x612&w=0&k=20&c=YBwxnGH3MkOLLpBKCvWAD8F__T-ypznRUJ_N13Zb1cU=', 1, 1737620623000, 1737620623000, 4, 4 );

INSERT INTO hotel_rooms(
    `id_type_room`, `name`, `description`, `telp`, `status`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 'A001', '-', 121212112, 'available', 1737620623000, 1737620623000, 4, 4 ),
    ( 2, 'A001', '-', 121212112, 'available', 1737620623000, 1737620623000, 4, 4 ),
    ( 3, 'A001', '-', 121212112, 'available', 1737620623000, 1737620623000, 4, 4 ),
    ( 4, 'A001', '-', 121212112, 'available', 1737620623000, 1737620623000, 4, 4 ),
    ( 1, 'A002', '-', 121212112, 'available', 1737620623000, 1737620623000, 4, 4 );

INSERT INTO hotel_type_room_price_period(
    `id_type_room`, `name`, `start_at`, `end_at`, `status`, `default`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 'Default Price', 1737620623000, 1737620623000, 'active', 1, 1737620623000, 1737620623000, 4, 4 ),
    ( 2, 'Default Price', 1737620623000, 1737620623000, 'active', 1, 1737620623000, 1737620623000, 4, 4 ),
    ( 3, 'Default Price', 1737620623000, 1737620623000, 'active', 1, 1737620623000, 1737620623000, 4, 4 ),
    ( 4, 'Default Price', 1737620623000, 1737620623000, 'active', 1, 1737620623000, 1737620623000, 4, 4 );

INSERT INTO hotel_type_room_dynamic_price(
    `id_price_period`, `price_per_night`, `price_per_two_night`, `price_long_stay`, `category`, `created_at`, `updated_at`, `created_by`, `updated_by`
) VALUES ( 1, 1200000, 1000000, 900000, 'all_day', 1737620623000, 1737620623000, 4, 4 ),
( 2, 1400000, 1000000, 900000, 'all_day', 1737620623000, 1737620623000, 4, 4 ),
( 3, 1300000, 1000000, 900000, 'all_day', 1737620623000, 1737620623000, 4, 4 ),
( 4, 1400000, 1000000, 900000, 'all_day', 1737620623000, 1737620623000, 4, 4 );




-- +goose Down
DELETE FROM `hotel_type_room_dynamic_price`;
DELETE FROM `hotel_type_room_price_period`;
DELETE FROM `hotel_rooms`;
DELETE FROM `hotel_type_room_images`;
DELETE FROM `hotel_type_rooms`;
DELETE FROM `hotel_facilities`;
DELETE FROM `hotel_images`;
DELETE FROM `hotel_location`;
DELETE FROM `detail_hotel`;
DELETE FROM `hotels`;