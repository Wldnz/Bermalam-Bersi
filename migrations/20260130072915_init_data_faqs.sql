-- +goose Up
-- +goose StatementBegin
INSERT INTO `faqs` (`id_hotel`, `question`, `answer`, `category`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
-- FAQ UNTUK GUEST (Tamu)
(NULL, 'Bagaimana cara memesan hotel di Bermalam?', 'Pilih lokasi, tentukan tanggal, lalu klik pesan pada hotel pilihan Anda.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Apakah saya bisa membatalkan pesanan?', 'Pembatalan dapat dilakukan maksimal 24 jam sebelum waktu check-in.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Metode pembayaran apa saja yang tersedia?', 'Kami mendukung Transfer Bank, E-Wallet (OVO/Dana), dan Kartu Kredit.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Dimana saya bisa melihat voucher yang sudah diklaim?', 'Voucher tersedia di halaman profil pada menu "Voucher Saya".', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Apakah harga sudah termasuk sarapan?', 'Tergantung pada tipe kamar yang Anda pilih saat memesan.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Bagaimana jika saya telat check-in?', 'Harap hubungi pihak hotel melalui nomor yang tertera di detail pesanan.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Apakah data pribadi saya aman?', 'Kami menjamin keamanan data Anda dengan enkripsi standar industri.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Bagaimana cara memberikan rating hotel?', 'Setelah check-out, menu ulasan akan muncul di riwayat transaksi Anda.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Apakah ada biaya tambahan saat check-in?', 'Umumnya tidak ada, kecuali hotel mewajibkan deposit yang akan dikembalikan.', 'guest', 1706622321, 1706622321, 1, 1),
(NULL, 'Bisakah saya memesan hotel untuk orang lain?', 'Bisa, pastikan nama tamu diisi sesuai kartu identitas yang akan menginap.', 'guest', 1706622321, 1706622321, 1, 1),

-- FAQ UNTUK HOTEL_OWNER (Pemilik)
(NULL, 'Bagaimana cara mendaftarkan hotel saya?', 'Daftarkan akun sebagai Owner, lalu isi form "Tambah Hotel".', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Kapan saldo pesanan bisa ditarik?', 'Saldo dapat ditarik setelah tamu menyelesaikan proses check-out.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Berapa biaya komisi untuk Bermalam?', 'Komisi standar kami adalah 10% dari setiap transaksi yang sukses.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Bagaimana cara memperbarui stok kamar?', 'Anda dapat mengatur jumlah kamar melalui dashboard manajemen kamar.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Bisakah saya menolak pesanan tamu?', 'Pesanan hanya bisa ditolak dalam waktu 1 jam setelah booking dilakukan.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Bagaimana jika tamu merusak fasilitas?', 'Gunakan fitur pengajuan klaim deposit di dashboard owner.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Cara menambah foto hotel yang menarik?', 'Unggah foto berkualitas tinggi dengan pencahayaan terang di menu Galeri.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Bagaimana cara membuat promo diskon?', 'Masuk ke menu marketing, lalu buat voucher dengan minimal transaksi.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Apakah saya bisa mendaftarkan lebih dari satu hotel?', 'Bisa, satu akun owner dapat mengelola banyak unit hotel.', 'hotel_owner', 1706622321, 1706622321, 1, 1),
(NULL, 'Lupa password akun owner?', 'Gunakan fitur "Lupa Password" di halaman login untuk reset via email.', 'hotel_owner', 1706622321, 1706622321, 1, 1);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM `faqs`;
-- +goose StatementEnd