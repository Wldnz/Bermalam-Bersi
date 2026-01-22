"use client"
import ActionIcon from "@/components/Icons/Action"
import BookingIcons from "@/components/Icons/Booking"
import HotelIcons from "@/components/Icons/Hotel"
import TransactionIcons from "@/components/Icons/Transactions"
import Navigation from "@/components/Navigation"
import { useBooking } from "@/context/Booking"
import convertNumberIntoIDR from "@/utils/ConvertNumberToIDR"
import GetLabelDate from "@/utils/GetLabelDate"
import { getCurrentPriceLabel, totalRoomsLabel } from "@/utils/HotelPrice"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function CreateTransactionPage({ }) {

    const router = useRouter()

    const bookingContext = useBooking()

    if (!bookingContext) return router.push("/")

    const checkInDate = new Date(bookingContext.bookingData!.checkIn)
    const checkOutDate = new Date(bookingContext.bookingData!.checkIn)

    console.log(bookingContext.orders)

    return (
        <div className="w-full min-h-dvh flex flex-col gap-10 font-inter">
            <Navigation showNavigation={false} />

            <div className="flex gap-5 justify-between">

                <div className="w-full flex flex-col gap-10 p-3">
                    <p className="p-2 bg-red-200 font-bold rounded-lg">Pembayaran awal tidak dapat dilakukan pada pemesanan ini, karena salah satu kamar tidak mendukungnya</p>

                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-xl">Lengkapi Data Yuk!</h2>
                            <span className="text-sm">Data Dibawah Ini yang bertanggung jawab dalam transaksi</span>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <div className="flex flex-col gap-0.5">
                                <label htmlFor="full_name">Nama Lengkap</label>
                                <span className="text-sm">Masukkan Nama Panjang Anda</span>
                            </div>
                            <input className="text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg" type="text" placeholder="Masukkan Nama Lengkap Anda" />
                        </div>

                        <div className="flex justify-between gap-2.5">
                            <div className="w-full flex flex-col gap-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <label htmlFor="email">Alamat Email</label>
                                    <span className="text-sm">Masukkan alamat email yang masih aktif dan benar.</span>
                                </div>
                                <input className="text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg" type="email" placeholder="Masukkan Alamaat Email Anda!" />
                            </div>
                            <div className="w-full flex flex-col gap-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <label htmlFor="telp">Nomor Telepon</label>
                                    <span className="text-sm">Masukkan Nomor Telepon Anda Yang Masih Aktif</span>
                                </div>
                                <input className="text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg" type="text" inputMode="numeric" placeholder="815454512" />
                            </div>
                        </div>

                    </div>

                    {/* login jika belum login */}

                    <div className="w-full p-3 flex items-center justify-between bg-(--status-refund) rounded-lg">
                        <div className="flex items-center gap-2.5">
                            <span className="text-background">Keuntungan Menjadi Anggota Bermalam</span>
                            <ActionIcon className="w-5 h-5 text-background" name="information" />
                        </div>
                        <div className="flex gap-3 text-background">
                            <button >Daftar</button>
                            <span> | </span>
                            <button >Login</button>
                        </div>
                    </div>


                    {/* summary orders */}

                    <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl">Ringkasan Kamar Hotel Yang Kamu Pesan Nih...</h2>
                            <span className="text-sm">Silahkan cek terlebih dahulu ya, sebelum membuat transaksi!</span>
                        </div>

                        {bookingContext.orders.map(({ room, quantity }, index) => {
                            return <div className="flex flex-col gap-4" key={`${room.name}-${quantity}-${index}`}>

                                <button className="w-full flex items-center justify-between bg-(--status-refund) text-background p-3 rounded-t-lg">
                                    <h2 className="font-medium text-lg">{`Lengkapi Data Pemesanan Kamar #${index + 1}`}</h2>
                                    <ActionIcon className="w-8 h-8 cursor-pointer" name="negative" />
                                </button>


                                {/* data room */}

                                <div className="flex flex-col gap-4">
                                    <div className="w-full flex gap-4">
                                        <Image
                                            className="rounded-lg"
                                            src={room.image_url}
                                            width={400}
                                            height={200}
                                            alt={`${room.name}-${quantity}`}
                                        />
                                        <div className="w-full flex justify-between">
                                            <div className="flex flex-col gap-3">
                                                <h4 className="text-xl font-medium">{room.name}</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <BookingIcons className="w-6 h-6" name="adult" />
                                                        <span className="">{room.max_adults} Tamu</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <HotelIcons className="w-6 h-6" name="room-size" />
                                                        <span className="">{room.room_size} m^2</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <HotelIcons className="w-6 h-6" name={room.bed_type} />
                                                        <span className="">Single Bed</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2.5">
                                                    {room.free_cancel ? <div className="flex items-center gap-2.5">
                                                        <ActionIcon className="w-6 h-6" name="success" />
                                                        <span className="">Gratis Pembatalan</span>
                                                    </div> : <></>}
                                                    <div className="flex items-center gap-2.5">
                                                        <ActionIcon className="w-6 h-6" name={room.refundable ? "success" : "close_tight"} />
                                                        <span className="">{room.refundable ? "Kamar Bisa Direfund" : "Kamar Tidak Bisa Direfund"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-between items-end text-end text-(--status-refund)">
                                                <span>{totalRoomsLabel(room.total_rooms)}</span>
                                                <div className="flex flex-col gap-1">
                                                    <span>1x Kamar</span>
                                                    <span className="text-foreground line-through"> {convertNumberIntoIDR(
                                                        Number(room.default_price) * quantity
                                                    )} </span>
                                                    <span className="font-bold text-lg">{getCurrentPriceLabel(
                                                        Number(room.default_price) * quantity,
                                                        Number(room.minimum_price) * quantity
                                                    )}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* data tamu yang bertaunggung jawab */}

                                    {new Array(quantity).fill(null).map((v, data_index) => {
                                        return <div className="flex flex-col gap-5 mt-5" key={`data-tamu-${room.name}-${data_index}`}>
                                            <h2 className="font-medium text-xl">Data Tamu Yang Bertanggung Jawab #{data_index + 1}</h2>
                                            <button className="flex items-center gap-2.5">
                                                <div className="w-5.5 h-5.5 border-3 border-(--status-refund) rounded-lg"></div>
                                                <span>Apakah Penanggung Jawab Sama Dengan Kamar Sebelumnya?</span>
                                            </button>
                                            <div className="flex flex-col gap-5">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-lg font-medium" htmlFor={`full_name-${room.name}-${data_index}`}>Nama Lengkap</label>
                                                        <span className="text-sm">Masukkan Nama Panjang Anda</span>
                                                    </div>
                                                    <input className="text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg"
                                                        id={`full_name-${room.name}-${data_index}`}
                                                        type="text" placeholder="Masukkan Nama Lengkap Anda" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-lg font-medium" htmlFor={`telephone-${room.name}-${data_index}`}>Nomor Telepon</label>
                                                        <span className="text-sm">Nomor Telepon yang dapat kami hubungi</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <select className="w-max h-full px-2 flex items-center justify-center border-2 border-(--status-refund) outline-none rounded-lg appearance-none">
                                                            <option value="62">+62</option>
                                                        </select>
                                                        <input className="w-full text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg"
                                                            id={`telephone-${room.name}-${data_index}`}
                                                            type="text" placeholder="8128121281" />
                                                    </div>
                                                    <button className="flex items-center gap-2.5 mt-2">
                                                        <div className="w-6 h-6 border-2 border-(--status-refund) rounded-lg"></div>
                                                        <span className="">Apakah nomer telepon terdaftar pada WhastApp?</span>
                                                    </button>
                                                </div>
                                            </div>
                                            <details className="group">
                                                <summary className="p-3 flex justify-between items-center bg-(--status-refund) rounded-lg cursor-pointer">
                                                    <div className="flex items-center gap-1.5">
                                                        <ActionIcon className="w-6 h-6 text-background" name="information" />
                                                        <span className="text-background font-medium">Kamu Memiliki Permintaan Tambahan?</span>
                                                    </div>
                                                    <ActionIcon className="w-7 h-7 text-background" name="negative" />
                                                </summary>
                                                <div className="flex flex-col gap-2.5 p-3 bg-background">
                                                    <label className="font-medium" htmlFor={`note-${room.name}-${data_index}`}>Kamu Ada Permintaan Tambahan?</label>
                                                    <span className="text-sm">Catatan: Permintaan tambahan ini tidak bisa dijamin penuh namun akan diusahakan oleh pihak hotel, dan jika terpenuhi kemungkinan ada biaya tambahan</span>
                                                    <textarea className="p-2 border-2 border-(--status-refund) text-sm rounded-lg outline-none" name={`note-${room.name}-${data_index}`} id={`note-${room.name}-${data_index}`} placeholder="contoh : tolong siapkan kursi bayi ya"></textarea>
                                                </div>
                                            </details>
                                        </div>
                                    })}
                                </div>

                            </div>
                        })}

                    </div>

                </div>

                {/* summary orders */}

                <div className="w-120 h-max p-3 flex flex-col gap-5 bg-background rounded-xl sticky top-0 right-0">
                    <h4 className="">Ringkasan Pemesanan (Bayar Penuh)</h4>
                    {/* summary date */}
                    <div className="flex flex-col gap-3">
                        <div className="w-full flex justify-between items-center gap-2.5">
                            <div className="flex items-center gap-1.5">
                                <BookingIcons className="w-6 h-6 text-(--status-refund)" name="check_in" />
                                <span className="text-sm">{GetLabelDate(checkInDate)}</span>
                            </div>
                            <ActionIcon className="w-6 h-6 text-(--status-refund)" name="arrow-right" />
                            <div className="flex items-center gap-1.5">
                                <BookingIcons className="w-6 h-6 text-(--status-refund)" name="check_out" />
                                <span className="text-sm">{GetLabelDate(checkOutDate)}</span>
                            </div>
                        </div>
                        <div className="w-full flex items-center gap-2.5">
                            <div className="flex items-center gap-1.5">
                                <BookingIcons className="w-6 h-6 text-(--status-refund)" name="adult" />
                                <span className="text-sm">{bookingContext.bookingData?.guests.adults} Dewasa, {bookingContext.bookingData?.guests.childrens} Anak - Anak</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BookingIcons className="w-6 h-6 text-(--status-refund)" name="room" />
                                <span className="text-sm">{bookingContext.bookingData?.totalRooms} Kamar</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex flex-col gap-3">
                        <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Biaya Harga Kamar (x{bookingContext.bookingData?.totalRooms})</span>
                            <span className="text-sm">{convertNumberIntoIDR(
                                bookingContext.orders.reduce((acc, currentValue) => {
                                    return acc + (Number(currentValue.room.default_price) * currentValue.quantity)
                                }, 0))}</span>
                        </div>
                        <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Potongan Biaya (x{bookingContext.bookingData?.totalRooms})</span>
                            <span className="text-sm">Rp. 300.000,00</span>
                        </div>
                        <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Potongan Biaya</span>
                            <span className="text-sm">Rp. 300.000,00</span>
                        </div>
                        <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Total Biaya Kamar (x{bookingContext.bookingData?.totalRooms})</span>
                            <span className="text-sm">Rp. 5.700.000,00</span>
                        </div>
                        <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Biaya Langganan Aplikasi</span>
                            <span className="text-sm">Rp. 3.000,00</span>
                        </div>
                        <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Total Harga</span>
                            <span className="text-sm">Rp. 5.700.000,00</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            className="w-full h-10 p-2 border-2 border-(--status-refund) outline-none rounded-lg"
                            name="" id=""
                        >
                            <option value=""></option>
                        </select>
                        <button className="w-12 h-10 p-2 flex justify-center items-center border-2 border-(--status-refund) rounded-lg cursor-pointer">
                            <TransactionIcons className="w-8 h-8 text-(--status-refund)" name="voucher" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <input
                            className="w-4 h-4 p-2 border-2 border-(--status-refund) rounded-xl cursor-pointer"
                            type="checkbox"
                            id="accept_the_terms"
                        />
                        <label className="text-sm cursor-pointer" htmlFor="accept_the_terms">Setuju Dengan Kebijakan Yang Anda!</label>
                    </div>
                    <button className="w-full p-2 bg-(--status-refund) text-background font-bold rounded-lg">Buat Transaksi</button>
                </div>

            </div>

        </div>
    )
}