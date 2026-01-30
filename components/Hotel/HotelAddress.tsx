
export default function HotelAddress() {
    return <div className="flex flex-col gap-4" id="near-facility">
        <h2 className="font-bold text-center text-3xl">Penasaran Dengan Yang Ada Disekitarnya?</h2>
        <p className="text-lg text-center">Tenang Aja, Kami sudah menyiapkan map yang dapat membantu kamu dalam mencari tempat bermalam dan berwisata disekitarnya</p>
        <div className="w-full h-200 bg-red-200 rounded-xl">
            <iframe className="w-full h-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224872.16700707143!2d114.87696614129857!3d-8.443611346517462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd23d739f22c9c3%3A0x54a38afd6b773d1c!2sUbud!5e0!3m2!1sid!2sid!4v1769746796163!5m2!1sid!2sid" width="600" height="450" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <h2 className="font-bold text-2xl text-center">Baca Yukk! Biar Tahu!</h2>
        <div className="w-full flex justify-center items-center gap-20">

            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-(--status-refund) rounded-lg"></div>
                    <span>Tempat Wisata</span>
                </div>
                <span className="text-sm">Temukan tempat untuk berwisata di sekitar hotel</span>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-(--b4) rounded-lg"></div>
                    <span>Fasilitas Umum</span>
                </div>
                <span className="text-sm">Temukan Fasilitas - Fasilitas Umum di sekitar hotel</span>
            </div>
        </div>
    </div>
}