"use client"
import { BookingState } from "@/components/FindHotel/models"
import ActionIcon from "@/components/Icons/Action"
import BookingIcons from "@/components/Icons/Booking"
import HotelIcons from "@/components/Icons/Hotel"
import Navigation from "@/components/Navigation"
import Api from "@/utils/Api"
import convertNumberIntoIDR from "@/utils/ConvertNumberToIDR"
import CreateQueryFindHotels from "@/utils/CreateQueryFindHotels"
import { getCurrentPriceLabel, totalRoomsLabel } from "@/utils/HotelPrice"
import Image from "next/image"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface FeedbackHotel {
    id: number
    guest_name: string
    value: string
    category: string
    stars: string
    created_at: string
    room_names: string
}

interface TypeRoom {
    id: number
    name: string
    description: string
    max_adults: number
    max_childrens: number
    room_size: number
    bed_type: string
    refundable: boolean
    free_cancel: boolean
    how_long_to_cancel: number
    default_price: string
    minimum_price: string
    total_rooms: number
    image_url: string
}

interface DetailRoom {
    images: {
        url: string
        is_pinned: boolean
    }[]
    rules: {
        name: string
        category: string
    }[]
    facilities: string[]
    benefits: {
        name: string
        category: string
    }[]
}

// interface buat pemesanan kamar, ambil data dari typeRoom dan detailRoom ada quantity juga
interface OrderRoom {
    room: TypeRoom
    detailRoom: DetailRoom
    quantity: number
}

interface DetailHotel {
    id: number
    name: string
    description: string
    stars: string

    location: {
        id: number
        address_1: string
        address_2: string
        zip_code: string
        country: string
        province: string
        city: string
        longitude: string
        latitude: string
    }

    images: {
        url: string
        is_pinned: boolean
    }[]

    facilities: {
        id: number
        facility_name: string
        category_name: string
    }[]

    type_rooms: TypeRoom[]

    feedbacks: FeedbackHotel[]

    faqs: {
        id: number
        question: string
        answer: string
    }[]
}

export default function DetailHotel() {

    const { id } = useParams()

    const searchParams = useSearchParams()

    const currentTime = new Date().getTime()

    const defaultBookingDate = {
        search: searchParams.get("search") ?? "",
        checkIn: searchParams.get("check_in") ? Number(searchParams.get("check_in")) : currentTime,
        checkOut: searchParams.get("check_out") ? Number(searchParams.get("check_out")) : currentTime + (60 * 60 * 24 * 1000),
        guests: {
            adults: searchParams.get("total_adults") ? Number(searchParams.get("total_adults")) : 1,
            childrens: searchParams.get("total_childrens") ? Number(searchParams.get("total_childrens")) : 0,
        },
        totalRooms: searchParams.get("total_rooms") ? Number(searchParams.get("total_rooms")) : 1,
        category: searchParams.get("category_property") ?? "all",
    }

    const [bookingDate, setBookingDate] = useState<BookingState>(defaultBookingDate)

    const [dataHotel, setDataHotel] = useState<DetailHotel | null>(null)

    const [currentFeedback, setCurrentFeedback] = useState<FeedbackHotel | null>(null)

    const [currentRoom, setCurrentRoom] = useState<TypeRoom | null>(null)

    const [detailRoom, setDetailRoom] = useState<DetailRoom | null>(null)

    const [orders, setOrders] = useState<OrderRoom[] | []>([])

    const [showPopUp, setShowPopUp] = useState({
        feedbacks: false,
        booking: false,
        orders: false,
    })

    useEffect(() => {
        const fetchDetailHotel = async () => {
            try {
                const { data, status } = await Api().get(`/hotels/${id}?${CreateQueryFindHotels(bookingDate)}`)
                if (status == 200) setDataHotel(data.data)
            } catch {
                setDataHotel(null)
            }
        }
        fetchDetailHotel()
    }, [])

    useEffect(() => {
        if (!currentRoom) return
        const fetchDetailRoom = async () => {
            try {
                const { data, status } = await Api().get(`/rooms/${currentRoom.id}`)

                if (status == 200) {
                    setDetailRoom(data.data)
                }

            } catch {
                setDetailRoom(null)
            }
        }
        fetchDetailRoom()
    }, [currentRoom])

    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />
        {/* detail hotel will be here... */}
        {dataHotel && <div className="flex flex-col p-4 gap-6">
            <span>Home/ Hotels/ {dataHotel?.name}</span>

            {/* summary booking date */}
            <div className="w-80 p-3 flex flex-col gap-2.5 bg-white border-3 border-(--status-refund) fixed top-10 right-0 rounded-lg rounded-bl-none">
                <span className="">Ringkasan Kunjungan Anda!</span>
                {showPopUp.booking && <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <h4 className="font-bold">Check-In</h4>
                        <button className="w-max p-2 flex items-center gap-1 border-2 border-(--status-refund) rounded-lg cursor-pointer">
                            <BookingIcons className="w-7 h-7 text-(--status-refund)" name="check_in" />
                            <span>21 November 2025</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h4 className="font-bold">Check-In</h4>
                        <button className="w-max p-2 flex items-center gap-1 border-2 border-(--status-refund) rounded-lg cursor-pointer">
                            <BookingIcons className="w-7 h-7 text-(--status-refund)" name="check_out" />
                            <span>22 November 2025</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h4 className="font-bold">Tamu</h4>
                        <button className="w-max p-2 flex items-center gap-1 border-2 border-(--status-refund) rounded-lg cursor-pointer">
                            <BookingIcons className="w-7 h-7 text-(--status-refund)" name="adult" />
                            <span>2 Dewasa, 1 Anak - Anak</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <h4 className="font-bold">Kamar</h4>
                        <button className="w-max p-2 flex items-center gap-1 border-2 border-(--status-refund) rounded-lg cursor-pointer">
                            <BookingIcons className="w-7 h-7 text-(--status-refund)" name="room" />
                            <span>2 Kamar</span>
                        </button>
                    </div>
                    <button className="p-2.5 bg-(--status-refund) text-background font-bold rounded-lg cursor-pointer">Simpan Perubahan</button>
                </div>}
                <button className="w-max p-2 bg-white border-3 border-(--status-refund) rounded-lg rounded-t-none absolute -bottom-10.25 -left-[2.5px] cursor-pointer"
                    onClick={() => {
                        setShowPopUp(prev => {
                            return {
                                ...prev,
                                ...{
                                    booking: !prev.booking,
                                }
                            }
                        })
                    }}
                >
                    <ActionIcon className="w-5 h-5 text-(--status-refund)" name={showPopUp.booking ? "arrow-up" : "arrow-down"} />
                </button>
            </div>

            {/* cart  */}

            {orders.length && <button className="w-15 h-15 flex justify-center items-center bg-(--status-refund) rounded-full fixed bottom-10 right-5  cursor-pointer"
                // tampilkan pop up, terkait apakah anda ingin menambahkan kamar lain? atau tidak? seperti di desain
                onClick={() => setShowPopUp(prev => {
                    return {
                        ...prev,
                        ...{
                            orders: true
                        }
                    }
                })}
            >
                <ActionIcon className="w-10 h-10 text-background" name="cart" />
                <span className="w-5 h-5 flex justify-center items-center bg-background text-(--status-refund) font-bold text-sm rounded-full absolute top-3 right-2">{orders.length}</span>
            </button>}

            {/* detail orders */}
            {showPopUp.orders ? <div className="w-full h-dvh p-3 flex justify-center items-center fixed top-0 left-0">
                <div className="w-full min-h-20 max-h-[90%] overflow-y-scroll border-2 border-(--status-refund) bg-white rounded-lg relative">
                    <div className="flex justify-between items-center p-4 border-b-2 border-(--status-refund)">
                        <h2 className="font-bold text-xl">Ringkasan Pemesanan Hotel</h2>
                        <div className="flex gap-2.5 items-center">
                            <div className="flex justify-between items-center gap-4 bg-(--status-refund) rounded-lg p-2">
                                <div className="flex items-center gap-0.5">
                                    <span className="text-xs font-bold text-background">Sehari</span>
                                    <BookingIcons className="w-4 h-4 text-(--b4)" name="sun" />
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <span className="text-xs font-bold text-background">2 Malam</span>
                                    <BookingIcons className="w-4 h-4 text-(--status-wait)" name="moon" />
                                </div>
                            </div>
                            <button className="cursor-pointer"
                                onClick={() => setShowPopUp(prev => {
                                    return {
                                        ...prev,
                                        ...{
                                            orders: false
                                        }
                                    }
                                })}
                            >
                                <ActionIcon className="w-7 h-7 text-(--status-refund)" name="close_tight" />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 p-5">
                        <h2 className="font-bold text-lg">Wah, Kamu Sudah Memesan 3 Unit Kamar Dari 2 Tipe Kamar</h2>
                        <div className="max-h-full flex flex-col gap-2.5">
                            {/* hotel-card-summary-order */}
                            <div className="flex gap-2.5">
                                <Image
                                    className="rounded-lg"
                                    width={300}
                                    height={200}
                                    src={"/images/dashboard.png"}
                                    alt="images"
                                />
                                <div className="w-full flex justify-between">
                                    <div className="flex flex-col gap-2.5">
                                        <h4 className="font-medium text-lg">Luxury Deluxe Room</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex items-center gap-1">
                                                <BookingIcons className="w-6 h-6" name="adult" />
                                                <span className="text-sm">3 Tamu</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <HotelIcons className="w-6 h-6" name="room-size" />
                                                <span className="text-sm">54 M^2</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {/* selain twin, single bed maka akan masuk ke kategori special bed */}
                                                <HotelIcons className="w-6 h-6" name="single_bed" />
                                                <span className="text-sm">Single Bed</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2">
                                                <ActionIcon className="w-5 h-5" name="success" />
                                                <span className="">Televesion</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ActionIcon className="w-5 h-5" name="success" />
                                                <span className="">Televesion</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ActionIcon className="w-5 h-5" name="success" />
                                                <span className="">Televesion</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ActionIcon className="w-5 h-5" name="success" />
                                                <span className="">Televesion</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between items-end">
                                        <span className="text-(--status-refund)">Kamar Terakhir</span>
                                        <div className="flex flex-col items-end gap-2.5">
                                            <span className="text-(--status-refund)">1x Kamar</span>
                                            <span className="line-through">Rp. 1.000.000,00/Malam</span>
                                            <span className="text-(--status-refund) text-lg font-bold">Rp. 900.000,00/Malam</span>
                                            <div className="flex items-center gap-2.5">
                                                <button className="flex justify-center items-center p-1 bg-(--status-refund) rounded-lg cursor-pointer">
                                                    <ActionIcon className="w-6 h-6 text-background" name="arrow-up" />
                                                </button>
                                                <input
                                                    className="w-10 p-1 text-center font-bold text-(--status-refund) border-2 border-(--status-refund) outline-none rounded-lg"
                                                    type="text"
                                                    inputMode="numeric"
                                                    minLength={1}
                                                    maxLength={2}
                                                />
                                                <button className="flex justify-center items-center p-1 bg-(--status-refund) rounded-lg cursor-pointer">
                                                    <ActionIcon className="w-6 h-6 text-background" name="arrow-up" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="w-full min-h-10 bg-red-200 flex sticky bottom-0 left-0"></div>
                </div>
            </div> : <></>}

            {/* images here */}
            {dataHotel.images.length && <div className="w-full overflow-x-scroll flex gap-2.5">
                {dataHotel.images.map((image, index) => {
                    return <Image
                        src={image.url}
                        width={500}
                        height={500}
                        alt="miaw"
                        key={image.url + index}
                    />
                })}
                {dataHotel.images.map((image, index) => {
                    return <Image
                        src={image.url}
                        width={500}
                        height={500}
                        alt="miaw"
                        key={image.url + index}
                    />
                })}
            </div>}

            <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="font-bold text-2xl">{dataHotel.name}</h2>
                    <span>Bintang Bintang | Sangat Baik</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <button className="p-1.5 bg-(--status-refund) border-2 border-(--status-refund) rounded-lg cursor-pointer">
                        <ActionIcon className="w-7 h-7 text-background" name="share" />
                    </button>
                    <button className="p-1.5 bg-background border-2 border-(--status-refund) rounded-lg cursor-pointer">
                        <ActionIcon className="w-7 h-7 text-(--status-refund)" name="wishlist" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <ShortcutInformationHotels />
                <div className="flex flex-col gap-1.5 p-1">
                    <h3 className="font-bold text-lg">Deskripsi</h3>
                    <span className="bg-background p-2">{dataHotel.description}</span>
                </div>
            </div>

            {dataHotel.facilities.length && <div className="flex flex-col gap-5 p-2" id="facilities">
                <h2 className="font-bold text-xl">Fasilitas - Fasilitas Yang Dimiliki</h2>
                <div className="flex gap-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-background rounded-lg"></div>
                            <h4 className="font-bold">Hiburan Dan Komunikasi</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                            <span className="">Televesion</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                            <span className="">Televesion</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                            <span className="">Televesion</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-background rounded-lg"></div>
                            <h4 className="font-bold">Fasilitas Umum</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                            <span className="">Televesion</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-background rounded-lg"></div>
                            <h4 className="font-bold">Makanan Dan Sarapan</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                            <span className="">Televesion</span>
                        </div>
                    </div>
                </div>
            </div>}

            {dataHotel.type_rooms.length && <div className="flex flex-col gap-5" id="rooms">
                <h2 className="font-bold text-xl">Terdapat {dataHotel.type_rooms.length} Tipe Kamar Yang Sesuai</h2>
                <div className="flex gap-6">
                    {dataHotel.type_rooms.map((room, index) => {
                        return <div className="max-w-80 flex flex-col gap-3 p-2" key={room.name + index}>
                            <Image
                                className="h-80 rounded-lg"
                                width={300}
                                height={400}
                                src={room.image_url}
                                alt={`image-room-${room.name}`}
                            />
                            <div className="flex flex-col gap-4 px-1">
                                <h4 className="">{room.name}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1">
                                        <BookingIcons className="w-6 h-6" name="adult" />
                                        <span className="text-sm">{room.max_adults} Tamu</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <HotelIcons className="w-6 h-6" name="room-size" />
                                        <span className="text-sm">{room.room_size} M^2</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {/* selain twin, single bed maka akan masuk ke kategori special bed */}
                                        <HotelIcons className="w-6 h-6" name={room.bed_type} />
                                        <span className="text-sm">Single Bed</span>
                                    </div>
                                </div>
                                {dataHotel.facilities.length && <div className="grid grid-cols-2 gap-2">
                                    {dataHotel.facilities.map((facility, index) => {
                                        return <div className="flex items-center gap-2" key={facility.category_name + index}>
                                            <ActionIcon className="w-5 h-5" name="success" />
                                            <span className="text-sm">{facility.facility_name}</span>
                                        </div>
                                    })}
                                </div>}

                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-(--status-refund) text-sm">{totalRoomsLabel(room.total_rooms)}</span>
                                    {Number(room.minimum_price) != 0 && <span className="text-sm line-through">{convertNumberIntoIDR(Number(room.default_price))}</span>}
                                    <span className="font-bold text-lg text-(--status-refund)">{getCurrentPriceLabel(Number(room.default_price), Number(room.minimum_price))}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <button className="text-(--status-refund) text-sm cursor-pointer"
                                        onClick={() => setCurrentRoom(room)}
                                    >Lihat Detail Kamar</button>
                                    <button className="bg-(--status-refund) text-background p-2 px-3 rounded-sm cursor-pointer"
                                        onClick={() => {
                                            const isFound = orders.find((order) => order.room.id == room.id)

                                            if (isFound) {
                                                const newQty = isFound.quantity++
                                                if (newQty > room.total_rooms) {
                                                    return alert(`Kamar Ingin Memesan ${newQty} Kamar? Namun Kamar Hanya Tersisa ${room.total_rooms} Yang Tersedia`)
                                                }
                                                isFound.quantity = newQty
                                                setOrders(prev => {
                                                    return [
                                                        ...prev,
                                                        ...[isFound]
                                                    ]
                                                })
                                            } else {
                                                const order = {
                                                    room: room,
                                                    quantity: 1
                                                } as OrderRoom
                                                setOrders(prev => {
                                                    return [
                                                        ...prev,
                                                        ...[order]
                                                    ]
                                                })
                                            }
                                        }}
                                    >Pilih Kamar</button>
                                </div>
                            </div>
                        </div>
                    })}
                </div>
                {currentRoom && detailRoom && <div className="w-full h-dvh p-2 flex justify-center items-center fixed top-0 left-0 z-10">
                    <div className="w-[90%] h-full flex flex-col gap-1 bg-white overflow-y-scroll rounded-lg relative">
                        <button className="w-max bg-white absolute top-6 right-7 cursor-pointer p-2 rounded-xl"
                            onClick={() => setCurrentRoom(null)}
                        >
                            <ActionIcon className="w-6 h-6 text-(--status-refund)" name="close_outline" />
                        </button>
                        <div className="flex flex-col gap-4 bg-background p-5">
                            <Image
                                className="w-full h-70 object-fill rounded-lg"
                                src={detailRoom.images[0].url}
                                width={200}
                                height={100}
                                alt={`detail-room-image-pinned`}
                            />
                            <div className="flex items-center gap-2.5 overflow-x-scroll">
                                {detailRoom.images.map((image, index) => {
                                    return <button className="min-w-50 cursor-pointer" key={`url-${image.url}-${index}`}>
                                        <Image
                                            className="w-full rounded-lg"
                                            src={image.url}
                                            width={200}
                                            height={100}
                                            alt={`detail-room-image-${index}`}
                                        />
                                    </button>
                                })}
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 p-5">
                            <div className="flex flex-col gap-2.5">
                                <h2 className="font-bold text-2xl">{currentRoom.name}</h2>
                                <span className="text-sm">{currentRoom.description}</span>
                            </div>
                            <div className="flex flex-col gap-3.5">
                                <h4 className="font-bold">Fasilitas Kamar</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <BookingIcons className="w-6 h-6" name="adult" />
                                        <span className="text-sm">{currentRoom.max_adults} Tamu</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <HotelIcons className="w-6 h-6" name="room-size" />
                                        <span className="text-sm">{currentRoom.room_size} M^2</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {/* selain twin, single bed maka akan masuk ke kategori special bed */}
                                        <HotelIcons className="w-6 h-6" name={currentRoom.bed_type} />
                                        <span className="text-sm">Single Bed</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {detailRoom.facilities.map((facility, index) => {
                                        return <div className="flex items-center gap-1" key={"facility" + index}>
                                            <ActionIcon className="w-6 h-6" name="success" />
                                            <span className="">{facility}</span>
                                        </div>
                                    })}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <h4 className="font-bold">Keuntungan Memesan Kamar</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {detailRoom.benefits?.map((benefit, index) => {
                                        return <div className="flex items-center gap-1" key={"benefit" + index}>
                                            <ActionIcon className="w-6 h-6" name={benefit.category == "free" ? "success" : "close_tight"} />
                                            <span className="">{benefit.name}</span>
                                        </div>
                                    })}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2.5">
                                <h4 className="font-bold">Peraturan Kamar</h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {detailRoom.rules?.map((rule, index) => {
                                        return <div className="flex items-center gap-1" key={"rule" + index}>
                                            <ActionIcon className="w-6 h-6" name={rule.category == "allowed" ? "success" : "close_tight"} />
                                            <span className="">{rule.name}</span>
                                        </div>
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="w-full min-h-30 p-3 bg-background flex justify-between items-center sticky bottom-0 left-0">
                            <button className="min-w-max h-15 font-bold text-background bg-(--status-refund) px-2 rounded-sm cursor-pointer">Pesan Kamar</button>
                            <div className="flex flex-col h-full justify-end text-end">
                                <span className="text-(--status-refund) font-bold">{totalRoomsLabel(currentRoom.total_rooms)}</span>
                                {Number(currentRoom.minimum_price) != 0 && <span className="line-through">{convertNumberIntoIDR(Number(currentRoom.default_price))} /Malam</span>}
                                <span className="text-lg text-(--status-refund) font-bold">{getCurrentPriceLabel(Number(currentRoom.default_price), Number(currentRoom.minimum_price))} /Malam</span>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>}

            <div className="flex flex-col gap-4" id="near-facility">
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

            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center">
                        <HotelIcons className="w-6 h-6 text-(--status-refund)" name="address" />
                        <span className="">Alamat Hotel</span>
                    </div>
                    <span className="text-sm pl-2">{dataHotel.location.address_1}</span>
                    <span className="text-sm pl-2 text-(--status-refund)">Dapatkan Alamat Pada Google Maps!</span>
                </div>
            </div>

            <div className="w-full h-40"></div>

            <div className="flex flex-col gap-20" id="feedbacks">
                <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-center text-3xl">Kamu Mungkin Penasaran Dengan Pengalaman Tamu Sebelumbya?</h2>
                    <p className="text-lg text-center">Dibawah ini  adalah pengalaman - pengalaman dari tamu sebelumnya!</p>
                </div>
                <div className="p-8 flex flex-wrap gap-16">
                    {dataHotel.feedbacks.map((feedback, index) => {
                        return <div className="max-w-100 flex flex-col gap-2.5" key={feedback.guest_name + feedback.id + index}>
                            <div className="flex justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 flex justify-center items-center p-2 text-background bg-(--status-refund) rounded-full">
                                        <span className="">{feedback.guest_name[0].toUpperCase()}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span>{feedback.guest_name}</span>
                                        <span className="text-sm">{feedback.room_names}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <span className="text-sm">{feedback.stars}</span>
                                    <HotelIcons className="w-4 h-4 text-(--b4)" name="star" />
                                </div>
                            </div>
                            <span className="text-sm">{feedback.value}</span>
                            <button className="flex items-center gap-2.5 text-(--status-refund) cursor-pointer"
                                onClick={() => {
                                    setShowPopUp(prev => ({ ...prev, ...{ feedbacks: true } }))
                                    setCurrentFeedback(feedback)
                                }}
                            >
                                <span className="text-sm">Baca Selengkapnya</span>
                                <ActionIcon className="w-6 h-6" name="read_book" />
                            </button>
                        </div>
                    })}
                </div>

                {showPopUp.feedbacks && <div className="w-full min-h-dvh flex justify-center items-center p-4 fixed top-0 left-0">
                    <div className="w-full p-4 border-2 border-(--status-refund) flex flex-col gap-5 bg-white rounded-lg">
                        <div className="flex justify-between items-center">
                            <span>Baca Selengkapnya Terkait Pengalaman Tamu</span>
                            <button className="flex items-center gap-1 text-(--status-refund) cursor-pointer"
                                onClick={() => {
                                    setShowPopUp(prev => ({ ...prev, ...{ feedbacks: false } }))
                                }}
                            >
                                <span className="text-sm">Close</span>
                                <ActionIcon className="w-5 h-5" name="close_tight" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-10 p-2">
                            <div className="w-full flex flex-col gap-5 bg-background p-2 rounded-lg">
                                <div className="flex justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 flex justify-center items-center p-2 text-background bg-(--status-refund) rounded-full">
                                            <span className="">{currentFeedback?.guest_name[0].toUpperCase()}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span>{currentFeedback?.guest_name}</span>
                                            <span className="text-sm">{currentFeedback?.room_names}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="text-sm">{currentFeedback?.stars}</span>
                                        <HotelIcons className="w-4 h-4 text-(--b4)" name="star" />
                                    </div>
                                </div>
                                <span className="text-sm">{currentFeedback?.value}</span>
                            </div>
                        </div>
                        <div className="w-full flex overflow-x-scroll">
                            {dataHotel.feedbacks.map((feedback, index) => {
                                return <button className="min-w-50 min-h-25 max-w-100 flex flex-col gap-2.5 cursor-pointer text-start" key={feedback.guest_name + feedback.id + index}
                                    onClick={() => {
                                        setCurrentFeedback(feedback)
                                    }}
                                >
                                    <div className="flex justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-10 h-10 flex justify-center items-center p-2 text-background bg-(--status-refund) rounded-full">
                                                <span className="">{feedback.guest_name[0].toUpperCase()}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 ">
                                                <span>{feedback.guest_name}</span>
                                                <span className="text-sm">{feedback.room_names}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <span className="text-sm">{feedback.stars}</span>
                                            <HotelIcons className="w-4 h-4 text-(--b4)" name="star" />
                                        </div>
                                    </div>
                                    <span className="text-sm">{feedback.value}</span>
                                </button>
                            })}
                        </div>
                    </div>
                </div>}

                {dataHotel.faqs.length && <div className="flex flex-col gap-4" id="faqs">
                    <h2 className="font-bold text-xl">Pertanyaan - Pertanyaan Yang Sering Diajukan</h2>
                    <div className="flex flex-col gap-4">
                        {dataHotel.faqs.map((faq, index) => {
                            return <details className="group cursor-pointer" key={`${faq.id + index} + ${faq.answer}`}>
                                <summary className="p-3 flex justify-between items-center bg-(--status-refund) text-background rounded-lg outline-none group-open:rounded-b-none">
                                    <span className="text-lg font-bold">{faq.question}</span>
                                    <div>
                                        <ActionIcon className="w-7 h-7 text-background group-open:hidden" name="positive" />
                                        <ActionIcon className="w-7 h-7 text-background hidden group-open:block" name="negative" />
                                    </div>
                                </summary>
                                <p className="p-4 bg-background group-open:rounded-b-lg">{faq.answer}</p>
                            </details>
                        })}
                    </div>
                </div>}
                {/* untuk menampilkan hotel - hotel yang mungkin anda suka */}
                <div className="flex flex-col gap-4">
                    <h2 className="font-bold text-xl">Kamu Mungkin Tertarik Dengan Tempat Bermalam Yang Lain</h2>
                    <div className="flex gap-2.5 flex-wrap">
                        <div className="w-80 h-100 bg-red-200"></div>
                    </div>
                </div>


            </div>

        </div>}


    </div>
}

function ShortcutInformationHotels() {

    const buttons = [
        {
            label: "Tentang Hotel",
            target: "#description",
            isActive: true
        },
        {
            label: "Fasilitas - Fasilitas",
            target: "#facilities",
            isActive: false
        },
        {
            label: "Kamar - Kamar",
            target: "#rooms",
            isActive: false
        },
        {
            label: "Tempat Disekitar Hotel",
            target: "#near-facility",
            isActive: false,
        },
        {
            label: "Ulasan Tamu",
            target: "#feedbacks",
            isActive: false
        },
        {
            label: "Pertanyaan Yang Sering Ditanyakan",
            target: "#faqs",
            isActive: false
        }
    ]

    return <div className="flex gap-2.5">
        {
            buttons.map((button, index) => {
                return <InformationHotel label={button.label} target={button.target} isActive={button.isActive} key={button.label + index} />
            })
        }
    </div>

}

function InformationHotel({
    label,
    target,
    isActive = false
}: {
    label: string,
    target: string,
    isActive?: boolean
}) {
    return <Link
        className={`p-2 px-2 ${isActive ? "text-background bg-(--status-refund)" : "text-(--status-refund)"} border-2 border-(--status-refund) hover:bg-(--status-refund) hover:text-background rounded-lg cursor-pointer`}
        href={target}
    >
        {label}
    </Link>
}