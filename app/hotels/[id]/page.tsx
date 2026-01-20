"use client"
import { BookingState } from "@/components/FindHotel/models"
import ActionIcon from "@/components/Icons/Action"
import BookingIcons from "@/components/Icons/Booking"
import HotelIcons from "@/components/Icons/Hotel"
import Navigation from "@/components/Navigation"
import Api from "@/utils/Api"
import CreateQueryFindHotels from "@/utils/CreateQueryFindHotels"
import Image from "next/image"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

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

    type_rooms: {
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
    }[]

    feedbacks: {
        id: number
        guest_name: string
        value: string
        category: string
        stars: string
        created_at: string
        room_names: string
    }[]

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

    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />
        {/* detail hotel will be here... */}
        {dataHotel && <div className="flex flex-col p-4 gap-6">
            <span>Home/ Hotels/ {dataHotel?.name}</span>

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

            {dataHotel.facilities.length && <div className="flex flex-col gap-5 p-2">
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

            {dataHotel.type_rooms.length && <div className="flex flex-col gap-5">
                <h2 className="font-bold text-xl">Terdapat {dataHotel.type_rooms.length} Tipe Kamar Yang Sesuai</h2>
                <div className="flex gap-6">
                    {dataHotel.type_rooms.map((room, index) => {
                        return <div className="flex flex-col gap-3 p-2" key={room.name + index}>
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
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-2">
                                        <ActionIcon className="w-5 h-5" name="success" />
                                        <span className="text-sm">Televesion</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ActionIcon className="w-5 h-5" name="success" />
                                        <span className="text-sm">Televesion</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ActionIcon className="w-5 h-5" name="success" />
                                        <span className="text-sm">Televesion</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ActionIcon className="w-5 h-5" name="success" />
                                        <span className="text-sm">Televesion</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-(--status-refund) text-sm">Kamar Terakhir</span>
                                    <span className="text-sm line-through">Rp. 1.000.000,00</span>
                                    <span className="font-bold text-lg text-(--status-refund)">Rp. 900.000,00</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-(--status-refund) text-sm">Lihat Detail Kamar</span>
                                    <button className="bg-(--status-refund) text-background p-2 px-3 rounded-sm cursor-pointer">Pilih Kamar</button>
                                </div>
                            </div>
                        </div>
                    })}
                </div>
            </div>}

            <div className="flex flex-col gap-4">
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
                {/* <div className="flex flex-col gap-2.5">
                    <div className="flex items-center">
                        <HotelIcons className="w-6 h-6 text-(--status-refund)" name="address" />
                        <span className="">Alamat Hotel</span>
                    </div>
                    <span className="text-sm pl-2">{dataHotel.location.address_1}</span>
                </div> */}
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