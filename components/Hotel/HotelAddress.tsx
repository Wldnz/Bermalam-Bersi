
export default function HotelAddress() {
    return <div className="flex flex-col gap-4" id="near-facility">
        <h2 className="font-bold text-center text-3xl">Penasaran Dengan Yang Ada Disekitarnya?</h2>
        <p className="text-lg text-center">Tenang Aja, Kami sudah menyiapkan map yang dapat membantu kamu dalam mencari tempat bermalam dan berwisata disekitarnya</p>
        <div className="w-full h-200 bg-red-200 rounded-xl"></div>
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