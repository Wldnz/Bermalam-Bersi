"use client"
import ActionIcon from "@/components/Icons/Action"
import BookingIcons from "@/components/Icons/Booking"
import HotelIcons from "@/components/Icons/Hotel"
import TransactionIcons from "@/components/Icons/Transactions"
import Navigation from "@/components/Navigation"
import { useBooking } from "@/context/Booking"
import Api from "@/utils/Api"
import convertNumberIntoIDR from "@/utils/ConvertNumberToIDR"
import GetLabelDate from "@/utils/GetLabelDate"
import { getCurrentPriceLabel, totalRoomsLabel } from "@/utils/HotelPrice"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface EstimatePrice{
    TotalPrice : number 
    TaxCost : number
    DiscountPrice : number
}


interface UserVoucher {
    id: number
    name: string
    description: string
    expired_at: number
}

interface RequestGuestRoom {
    full_name: string
    phone_country_code: number
    phone: string
    hasWhastApp: boolean
    note: string
    dataIsSameAsBefore: boolean
}

interface RequestOrderRooms {
    id_type_room: number,
    name: string,
    quantity: number,
    guests: RequestGuestRoom[] | []
}

interface RequestTransaction {
    fullname: string
    email: string
    phone_country_code: number
    phone: string
    isDataUpadted: boolean
    total_rooms: number
    check_in_at: number
    check_out_at: number
    adults: number,
    childrens: number,
    rooms: RequestOrderRooms[]
    voucher?: {
        id_user_voucher: number
        name: string
    } | null
    category_booking: "full" | "dp"
    simulation: true,
    currency: "IDR",
    language: "ID"
    is_calculation_price : boolean
}

export default function CreateTransactionPage({ }) {

    const router = useRouter()

    const bookingContext = useBooking()

    const { user } = bookingContext

    const [showRoom, setShowRoom] = useState<boolean>(true)

    const [transactionData, setTransactionData] = useState<RequestTransaction>()

    const [vouchers, setVouchers] = useState<UserVoucher[] | []>([])

    const [ estimatePrice, setEstimatePrice ] = useState<EstimatePrice>()


    useEffect(() => {

        if (bookingContext.bookingData && bookingContext.orders) {
            const rooms = bookingContext.orders.map(order => {
                return {
                    id_type_room: order.room.id,
                    name: order.room.name,
                    guests: new Array(order.quantity).fill({
                        full_name: "",
                        hasWhastApp: false,
                        note: "",
                        phone: "",
                        phone_country_code: 62,
                        dataIsSameAsBefore: false
                    } as RequestGuestRoom),
                    quantity: order.quantity,
                } as RequestOrderRooms
            })
            setTransactionData({
                fullname: user?.first_name ?? "",
                email: user?.email ?? "",
                phone: "",
                phone_country_code: 0,
                isDataUpadted: false,
                check_in_at: bookingContext.bookingData.checkIn,
                check_out_at: bookingContext.bookingData.checkIn,
                adults: bookingContext.bookingData.guests.adults,
                childrens: bookingContext.bookingData.guests.childrens,
                rooms: rooms,
                category_booking: "dp",
                currency: "IDR",
                language: "ID",
                simulation: true,
                total_rooms: bookingContext.bookingData.totalRooms,
                is_calculation_price : true,
                // voucher : {})
            }
            )
        }

    }, [bookingContext.bookingData, bookingContext.orders, user])

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const { data } = await Api().get("/vouchers/users")
                setVouchers(data.data)
            } catch {
                setVouchers([])
            }
        }
        fetchVouchers()
    }, [])

    useEffect(() => {

        const fetchEstimatePrice = async() => {
            try{
                const { data } = await Api().post("/check-price", transactionData)
                setEstimatePrice(data.data)
            }catch{
                setEstimatePrice(undefined)
            }finally{
                setTransactionData(prev => {
                    if(!prev) return prev
                    return {
                        ...prev,
                        ...{
                            is_calculation_price : false
                        }
                    }
                })
            }
        }

        if(transactionData?.is_calculation_price){
            fetchEstimatePrice()
        }

    }, [transactionData])

    


    if (!bookingContext.bookingData || !bookingContext.orders) {
        return <div>Loading Pemesanan....</div>
    }



    const checkInDate = new Date(bookingContext.bookingData!.checkIn)
    const checkOutDate = new Date(bookingContext.bookingData!.checkIn)

    // fetching credentials seperti nomro telepon, dan pengguna bisa merubah namanya disini... dan merubah nomor teleponnya! dan cari tahu bagaimana gar data dari bookingContext ini ttp ada walaupun di refresh... dan pastikan login mneggunakan googlenya berhasil

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
                            <input
                                className="text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg"
                                type="text"
                                value={transactionData?.fullname ?? user?.first_name}
                                readOnly
                                placeholder="Masukkan Nama Lengkap Anda" />
                        </div>

                        <div className="flex justify-between gap-2.5">
                            <div className="w-full flex flex-col gap-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <label htmlFor="email">Alamat Email</label>
                                    <span className="text-sm">Masukkan alamat email yang masih aktif dan benar.</span>
                                </div>
                                <input
                                    className="text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg"
                                    type="email"
                                    placeholder="Masukkan Alamaat Email Anda!"
                                    value={transactionData?.email ?? user?.email}
                                    readOnly
                                />
                            </div>
                            <div className="w-full flex flex-col gap-2.5">
                                <div className="flex flex-col gap-0.5">
                                    <label htmlFor="telp">Nomor Telepon</label>
                                    <span className="text-sm">Masukkan Nomor Telepon Anda Yang Masih Aktif</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <select className="w-max h-full border-2 border-(--status-refund) outline-none rounded-lg" name="" id="">
                                        <option value="62">+62</option>
                                    </select>
                                    <input className="w-full text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg" type="text" inputMode="numeric" placeholder="815454512"
                                    // value={0}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* login jika belum login */}

                    {!user && <div className="w-full p-3 flex items-center justify-between bg-(--status-refund) rounded-lg">
                        <div className="flex items-center gap-2.5">
                            <span className="text-background">Keuntungan Menjadi Anggota Bermalam</span>
                            <ActionIcon className="w-5 h-5 text-background" name="information" />
                        </div>
                        <div className="flex gap-3 text-background">
                            <button >Daftar</button>
                            <span> | </span>
                            <button >Login</button>
                        </div>
                    </div>}


                    {/* summary orders */}

                    <div className="flex flex-col gap-2.5">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl">Ringkasan Kamar Hotel Yang Kamu Pesan Nih...</h2>
                            <span className="text-sm">Silahkan cek terlebih dahulu ya, sebelum membuat transaksi!</span>
                        </div>

                        {bookingContext.orders.map(({ room, quantity }, index) => {
                            return <div className="flex flex-col gap-4" key={`${room.name}-${quantity}-${index}`}>

                                <button className={`w-full flex items-center justify-between bg-(--status-refund) text-background p-3 ${showRoom ? "rounded-t-lg" : "rounded-lg"}`}
                                    onClick={() => setShowRoom(prev => !prev)}
                                >
                                    <h2 className="font-medium text-lg">{`Lengkapi Data Pemesanan Kamar #${index + 1}`}</h2>
                                    <ActionIcon className="w-8 h-8 cursor-pointer" name={showRoom ? "negative" : "positive"} />
                                </button>


                                {/* data room */}

                                {showRoom && <div className="flex flex-col gap-4">
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
                                            <button className="flex items-center gap-2.5 cursor-pointer"
                                                onClick={() => setTransactionData(prev => {
                                                    if (!prev) return prev
                                                    return {
                                                        ...prev,
                                                        ... {
                                                            rooms: prev.rooms.map((r) => {
                                                                if (r.id_type_room == room.id) {
                                                                    return {
                                                                        ...r,
                                                                        ...{
                                                                            guests: r.guests.map((guest, gdi) => {
                                                                                if (gdi === data_index) {
                                                                                    return {
                                                                                        ...guest,
                                                                                        ...{
                                                                                            dataIsSameAsBefore: !guest.dataIsSameAsBefore
                                                                                        }
                                                                                    }
                                                                                }
                                                                                return guest
                                                                            })
                                                                        }
                                                                    }
                                                                }
                                                                return r
                                                            })
                                                        }
                                                    }
                                                })}
                                            >
                                                <div className={`w-5.5 h-5.5 border-3 border-(--status-refund) ${transactionData?.rooms[index].guests[data_index].dataIsSameAsBefore ?? false ? "bg-(--status-refund)" : ""} rounded-lg`}></div>
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
                                                        value={transactionData?.rooms[index].guests[data_index].full_name ?? ""}
                                                        onChange={(e) => setTransactionData(prev => {
                                                            if (!prev) return prev
                                                            return {
                                                                ...prev,
                                                                ... {
                                                                    rooms: prev.rooms.map((r) => {
                                                                        if (r.id_type_room == room.id) {
                                                                            return {
                                                                                ...r,
                                                                                ...{
                                                                                    guests: r.guests.map((guest, gdi) => {
                                                                                        if (gdi === data_index) {
                                                                                            return {
                                                                                                ...guest,
                                                                                                ...{
                                                                                                    full_name: e.target.value
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        return guest
                                                                                    })
                                                                                }
                                                                            }
                                                                        }
                                                                        return r
                                                                    })
                                                                }
                                                            }
                                                        })}
                                                        type="text" placeholder="Masukkan Nama Lengkap Anda" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-lg font-medium" htmlFor={`telephone-${room.name}-${data_index}`}>Nomor Telepon</label>
                                                        <span className="text-sm">Nomor Telepon yang dapat kami hubungi</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <select className="w-max h-full px-2 flex items-center justify-center border-2 border-(--status-refund) outline-none rounded-lg appearance-none"
                                                            value={transactionData?.rooms[index]?.guests[data_index]?.phone_country_code}
                                                            onChange={(e) => setTransactionData(prev => {
                                                                if (!prev) return prev
                                                                return {
                                                                    ...prev,
                                                                    ... {
                                                                        rooms: prev.rooms.map((r) => {
                                                                            if (r.id_type_room == room.id) {
                                                                                return {
                                                                                    ...r,
                                                                                    ...{
                                                                                        guests: r.guests.map((guest, gdi) => {
                                                                                            if (gdi === data_index) {
                                                                                                return {
                                                                                                    ...guest,
                                                                                                    ...{
                                                                                                        phone_country_code: Number(e.target.value)
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            return guest
                                                                                        })
                                                                                    }
                                                                                }
                                                                            }
                                                                            return r
                                                                        })
                                                                    }
                                                                }
                                                            })}
                                                        >
                                                            <option value="62">+62</option>
                                                        </select>
                                                        <input className="w-full text-sm p-3 border-2 border-(--status-refund) outline-none rounded-lg"
                                                            id={`telephone-${room.name}-${data_index}`}
                                                            value={transactionData?.rooms[index]?.guests[data_index]?.phone ?? ""}
                                                            onChange={(e) => setTransactionData(prev => {
                                                                if (!prev) return prev
                                                                return {
                                                                    ...prev,
                                                                    ... {
                                                                        rooms: prev.rooms.map((r) => {
                                                                            if (r.id_type_room == room.id) {
                                                                                return {
                                                                                    ...r,
                                                                                    ...{
                                                                                        guests: r.guests.map((guest, gdi) => {
                                                                                            if (gdi === data_index) {
                                                                                                return {
                                                                                                    ...guest,
                                                                                                    ...{
                                                                                                        phone: e.target.value
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            return guest
                                                                                        })
                                                                                    }
                                                                                }
                                                                            }
                                                                            return r
                                                                        })
                                                                    }
                                                                }
                                                            })}
                                                            type="text" placeholder="8128121281" />
                                                    </div>
                                                    <button className="flex items-center gap-2.5 mt-2 cursor-pointer"
                                                        onClick={() => setTransactionData(prev => {
                                                            if (!prev) return prev
                                                            return {
                                                                ...prev,
                                                                ... {
                                                                    rooms: prev.rooms.map((r) => {
                                                                        if (r.id_type_room == room.id) {
                                                                            return {
                                                                                ...r,
                                                                                ...{
                                                                                    guests: r.guests.map((guest, gdi) => {
                                                                                        if (gdi === data_index) {
                                                                                            return {
                                                                                                ...guest,
                                                                                                ...{
                                                                                                    hasWhastApp: !guest.hasWhastApp
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        return guest
                                                                                    })
                                                                                }
                                                                            }
                                                                        }
                                                                        return r
                                                                    })
                                                                }
                                                            }
                                                        })}
                                                    >
                                                        <div className={`w-6 h-6 border-2 border-(--status-refund) ${transactionData?.rooms[index]?.guests[data_index]?.hasWhastApp ?? false ? "bg-(--status-refund)" : ""} rounded-lg`}></div>
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
                                                    <textarea className="p-2 border-2 border-(--status-refund) text-sm rounded-lg outline-none" name={`note-${room.name}-${data_index}`} id={`note-${room.name}-${data_index}`} placeholder="contoh : tolong siapkan kursi bayi ya"
                                                        onChange={(e) => setTransactionData(prev => {
                                                            if (!prev) return prev
                                                            return {
                                                                ...prev,
                                                                ... {
                                                                    rooms: prev.rooms.map((r) => {
                                                                        if (r.id_type_room == room.id) {
                                                                            return {
                                                                                ...r,
                                                                                ...{
                                                                                    guests: r.guests.map((guest, gdi) => {
                                                                                        if (gdi === data_index) {
                                                                                            return {
                                                                                                ...guest,
                                                                                                ...{
                                                                                                    note: e.target.value
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                        return guest
                                                                                    })
                                                                                }
                                                                            }
                                                                        }
                                                                        return r
                                                                    })
                                                                }
                                                            }
                                                        })}
                                                        value={transactionData?.rooms[index].guests[data_index]?.note}
                                                    ></textarea>
                                                </div>
                                            </details>
                                        </div>
                                    })}
                                </div>}

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
                        {/* <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Potongan Biaya (x{bookingContext.bookingData?.totalRooms})</span>
                            <span className="text-sm">Rp. 300.000,00</span>
                        </div> */}
                        <div className="w-full flex items-center justify-between font-medium">
                            <span className="text-sm">Potongan Biaya</span>
                            <span className="text-sm">{ convertNumberIntoIDR(estimatePrice?.DiscountPrice ?? 0) }</span>
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
                            onChange={(e) => {
                                setTransactionData(prev => {
                                if (!prev) return prev
                                return {
                                    ...prev,
                                    ...{
                                        voucher : e.target.value? {
                                            id_user_voucher : Number(e.target.value),
                                            name : e.target.textContent
                                        } : null,
                                        is_calculation_price : true
                                    }
                                }
                            })
                            }}
                        >
                            <option value=""></option>
                            {vouchers.map((voucher, index) => {
                                return <option value={voucher.id} key={`user-voucher-${index}`}>{voucher.name}</option>
                            })}
                        </select>
                        <button className="w-12 h-10 p-2 flex justify-center items-center border-2 border-(--status-refund) rounded-lg cursor-pointer"
                        >
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
                    <button className="w-full p-2 bg-(--status-refund) text-background font-bold rounded-lg"
                        onClick={() => console.log(transactionData)}
                    >Buat Transaksi</button>
                </div>

            </div>

        </div>
    )
}