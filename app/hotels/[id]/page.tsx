"use client"
import { BookingState } from "@/components/FindHotel/models"
import HotelAddress from "@/components/Hotel/HotelAddress"
import HotelFacilities from "@/components/Hotel/HotelFacilities"
import HotelFaqs from "@/components/Hotel/HotelFaqs"
import HotelFeedbacks from "@/components/Hotel/HotelFeedbacks"
import ActionIcon from "@/components/Icons/Action"
import BookingIcons from "@/components/Icons/Booking"
import HotelIcons from "@/components/Icons/Hotel"
import Navigation from "@/components/Navigation"
import ShowAlert from "@/components/ShowAlert"
import { useBooking } from "@/context/Booking"
import { Faqs } from "@/models/Faqs"
import { FeedbackHotel } from "@/models/HotelFeedbacks"
import { OrderRoom, TypeRoom } from "@/models/Room"
import { ShowAlertProps } from "@/models/ShowAlertProps"
import ShowPopupProps from "@/models/ShowPopup"
import Api from "@/utils/Api"
import convertNumberIntoIDR from "@/utils/ConvertNumberToIDR"
import CreateQueryFindHotels from "@/utils/CreateQueryFindHotels"
import GetLabelDate from "@/utils/GetLabelDate"
import GetTotalNights from "@/utils/GetTotalNight"
import { getCurrentPriceLabel, totalRoomsLabel } from "@/utils/HotelPrice"
import SetShowAlertStateAction from "@/utils/SetShowAlert"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"


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

    faqs: Faqs[]
}

export default function DetailHotel() {

    const { id } = useParams()

    const router = useRouter()

    const searchParams = useSearchParams()

    const currentTime = new Date().getTime()

    const bookingContext = useBooking();

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

    const [currentRoom, setCurrentRoom] = useState<TypeRoom | null>(null)

    const [detailRoom, setDetailRoom] = useState<DetailRoom | null>(null)

    const [orders, setOrders] = useState<OrderRoom[] | []>([])

    // const [showAlert, setShowAlert] = useState<boolean>(false)

    const [showAlertProps, setShowAlertProps] = useState<ShowAlertProps>()

    const [showPopUp, setShowPopUp] = useState<ShowPopupProps>({
        booking: false,
        orders: false,
        guests: false,
        rooms: false,
    })

    async function fetchDetailHotel() {
        try {
            const { data, status } = await Api().get(`/hotels/${id}?${CreateQueryFindHotels(bookingDate)}`)
            if (status == 200) setDataHotel(data.data)
            const { type_rooms } = data.data as DetailHotel
            if (!type_rooms || !type_rooms.length) {
                SetShowAlertStateAction({
                    title: "Tidak Dapat Menemukan Kamar Yang Tersedia",
                    description: "Kami tidak dapat menemukan kamar yang tersedia yang sesuai dengan permintaan kamu!",
                    actions: [
                        {
                            label: "Saya ingin merubah data pemesana kamar",
                            handler: () => {
                                setShowPopUp(prev => {
                                    return {
                                        ...prev,
                                        ... {
                                            booking: true
                                        }
                                    }
                                })
                            },
                        }
                    ],
                    category: "information",
                    iShowed: true
                }, setShowAlertProps)
            }

        } catch {
            setDataHotel(null)
        }
        setOrders([])
    }

    useEffect(() => {
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

    const totalNights = GetTotalNights(bookingDate.checkIn, bookingDate.checkOut)

    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />
        {/* detail hotel will be here... */}
        {dataHotel && <div className="flex flex-col p-4 gap-6">

            {showAlertProps && showAlertProps.iShowed && <ShowAlert
                showedAlertProps={showAlertProps}
                setShowedAlertProps={setShowAlertProps}
            />}

            <span>Home/ Hotels/ {dataHotel?.name}</span>

            {/* summary booking date */}



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
                                {totalNights - 1 ? <div className="flex items-center gap-0.5">
                                    <span className="text-xs font-bold text-background">{totalNights - 1 ? `${totalNights - 1} Hari` : "Sehari"}</span>
                                    <BookingIcons className="w-4 h-4 text-(--b4)" name="sun" />
                                </div> : <></>}
                                <div className="flex items-center gap-0.5">
                                    <span className="text-xs font-bold text-background">{totalNights ? `${totalNights} Malam` : "Semalam"}</span>
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
                            {orders.map(({ room, quantity }, index) => {
                                return <div className="flex gap-2.5" key={`order-${index}`}>
                                    <Image
                                        className="rounded-lg"
                                        width={300}
                                        height={200}
                                        src={room.image_url}
                                        alt={`${room.name}-order`}
                                    />
                                    <div className="w-full flex justify-between">
                                        <div className="flex flex-col gap-2.5">
                                            <h4 className="font-medium text-lg">{room.name}</h4>
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
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <ActionIcon className="w-5 h-5" name="success" />
                                                    <span className="">{room.free_cancel ? "yes" : "noe"}</span>
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
                                            <span className="text-(--status-refund)">{totalRoomsLabel(room.total_rooms)}</span>
                                            <div className="flex flex-col items-end gap-2.5">
                                                <span className="text-(--status-refund)">{quantity}x Kamar</span>
                                                {/* <span className="line-through">{convertNumberIntoIDR(Number(room.default_price))}/Malam</span> */}
                                                <span className="text-(--status-refund) text-lg font-bold">{getCurrentPriceLabel(Number(room.default_price), Number(room.minimum_price))}/Malam</span>
                                                <div className="flex items-center gap-2.5">
                                                    <button className="flex justify-center items-center p-1 bg-(--status-refund) rounded-lg cursor-pointer"
                                                        onClick={() => {
                                                            const newOrders = orders.map(r => {
                                                                if (r.room.id == room.id) {
                                                                    const qty = r.quantity + 1
                                                                    if (qty > Number(room.total_rooms)) {
                                                                        alert(`Kamu tidak bisa memesan kamar lebih besar dari ${room.total_rooms}`)
                                                                    } else {
                                                                        r.quantity = qty
                                                                    }
                                                                }
                                                                return r
                                                            })
                                                            setOrders(newOrders as OrderRoom[])
                                                            const countTotalRooms = newOrders.reduce((acc, currentValue) => {
                                                                return acc + currentValue.quantity
                                                            }, 0)
                                                            setBookingDate(prev => {
                                                                return {
                                                                    ...prev,
                                                                    ...{
                                                                        totalRooms: countTotalRooms
                                                                    }
                                                                }
                                                            })
                                                        }}
                                                    >
                                                        <ActionIcon className="w-6 h-6 text-background" name="arrow-up" />
                                                    </button>
                                                    <input
                                                        className="w-10 p-1 text-center font-bold text-(--status-refund) border-2 border-(--status-refund) outline-none rounded-lg"
                                                        type="number"
                                                        inputMode="numeric"
                                                        minLength={1}
                                                        maxLength={2}
                                                        value={quantity}
                                                        onChange={(e) => {
                                                            try {
                                                                const qty = Number(e.target.value) ?? 1
                                                                const newOrders = orders.map(r => {
                                                                    if (r.room.id == room.id) {
                                                                        if (qty <= 0) {
                                                                            return null
                                                                        } else {
                                                                            r.quantity = qty
                                                                        }
                                                                    }
                                                                    return r
                                                                }).filter(r => r)
                                                                setOrders(newOrders as OrderRoom[])
                                                                const countTotalRooms = (newOrders as OrderRoom[]).reduce((acc, currentValue) => {
                                                                    return acc + currentValue.quantity
                                                                }, 0)
                                                                setBookingDate(prev => {
                                                                    return {
                                                                        ...prev,
                                                                        ...{
                                                                            totalRooms: countTotalRooms
                                                                        }
                                                                    }
                                                                })
                                                            } catch {
                                                                setOrders(prev => prev)
                                                            }
                                                        }}
                                                    />
                                                    <button className="flex justify-center items-center p-1 bg-(--status-refund) rounded-lg cursor-pointer"
                                                        onClick={() => {
                                                            const newOrders = orders.map(r => {
                                                                if (r.room.id == room.id) {
                                                                    const qty = r.quantity - 1
                                                                    if (qty <= 0) {
                                                                        return null
                                                                    } else {
                                                                        r.quantity = qty
                                                                    }
                                                                }
                                                                return r
                                                            }).filter(r => r)
                                                            setOrders(newOrders as OrderRoom[])
                                                        }}
                                                    >
                                                        <ActionIcon className="w-6 h-6 text-background" name="arrow-down" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            })}
                        </div>
                    </div>
                    <div className="w-full p-4 bg-background flex justify-between items-end sticky bottom-0 left-0">
                        <div className="flex flex-col justify-end gap-1">
                            <span className="text-(--status-refund)">{orders.reduce((acc, cur) => {
                                return acc + cur.quantity
                            }, 0)}x Kamar</span>
                            {/* <span className="text-sm line-through">{convertNumberIntoIDR(orders.reduce((acc, cur) => {
                                return acc + Number(cur.room.default_price) * cur.quantity
                            }, 0))}</span> */}
                            <span className="text-lg font-bold text-(--status-refund)">{
                                getCurrentPriceLabel(orders.reduce((acc, cur) => {
                                    return acc + Number(cur.room.default_price) * cur.quantity * totalNights
                                }, 0), orders.reduce((acc, cur) => {
                                    return acc + Number(cur.room.minimum_price) * cur.quantity * totalNights
                                }, 0))
                            }/ Malam</span>
                            <div className="flex items-center gap-1">
                                <ActionIcon className="w-6 h-6 text-(--status-refund)" name="information" />
                                <span className="text-sm">Belum Termasuk Pajak Dan Biaya Tambahan</span>
                            </div>
                        </div>
                        <button className="h-15 p-3 text-background font-bold bg-(--status-refund) rounded-sm cursor-pointer"
                            onClick={() => {
                                bookingContext.saveBooking(bookingDate)
                                bookingContext.saveOrders(orders)
                                router.push("/transactions/create")
                            }}
                        >Pesan Sekarang</button>
                    </div>
                </div>
            </div> : <></>}

            {/* images here */}
            {dataHotel.images?.length && <div className="w-full overflow-x-scroll flex gap-2.5">
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


            {/* still need to update in here... */}
            <HotelFacilities />

            {dataHotel.type_rooms?.length ? <div className="flex flex-col gap-5" id="rooms">
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
                                {dataHotel.facilities?.length && <div className="grid grid-cols-2 gap-2">
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
                                    <span className="font-bold text-lg text-(--status-refund)">{getCurrentPriceLabel(Number(room.default_price), Number(room.minimum_price))}/Malam</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <button className="text-(--status-refund) text-sm cursor-pointer"
                                        onClick={() => setCurrentRoom(room)}
                                    >Lihat Detail Kamar</button>
                                    <button className="bg-(--status-refund) text-background p-2 px-3 rounded-sm cursor-pointer"
                                        onClick={() => {
                                            const isFound = orders.find((order) => order.room.id == room.id)
                                            if (isFound) {
                                                const newQty = isFound.quantity + 1
                                                if (newQty > Number(room.total_rooms)) {
                                                    alert(`Kamar Ingin Memesan ${newQty} Kamar? Namun Kamar Hanya Tersisa ${room.total_rooms} Yang Tersedia`)
                                                    return
                                                }
                                                isFound.quantity = newQty
                                                const newOrders = orders.map(order => {
                                                    order.quantity = newQty
                                                    return order
                                                })
                                                setOrders(newOrders)
                                                setOrders(prev => {
                                                    return prev.map(order => {
                                                        order.quantity = newQty
                                                        return order
                                                    })
                                                })
                                                const countTotalRooms = newOrders.reduce((acc, currentValue) => {
                                                    return acc + currentValue.quantity
                                                }, 0)
                                                setBookingDate(prev => {
                                                    return {
                                                        ...prev,
                                                        ...{
                                                            totalRooms: countTotalRooms
                                                        }
                                                    }
                                                })
                                            } else {
                                                const order = {
                                                    room: room,
                                                    quantity: 1,
                                                    checkIn: bookingDate.checkIn,
                                                    checkOut: bookingDate.checkOut,
                                                } as OrderRoom

                                                const newOrders = [
                                                    ...orders,
                                                    ...[order]
                                                ]

                                                setOrders(newOrders)

                                                const countTotalRooms = newOrders.reduce((acc, currentValue) => {
                                                    return acc + currentValue.quantity
                                                }, 0)
                                                setBookingDate(prev => {
                                                    return {
                                                        ...prev,
                                                        ...{
                                                            totalRooms: countTotalRooms
                                                        }
                                                    }
                                                })
                                            }
                                            SetShowAlertStateAction({
                                                title: "Berhasil Menambahkan Kamar Kedalam Pemesanan",
                                                description: "Apakah kamu ingin menambahkan kamar lain, kedalam pemesanan?",
                                                category: "success",
                                                actions: [
                                                    {
                                                        label: "Saya ingin menambahkan kamar lain",
                                                        handler: () => { }
                                                    }
                                                ],
                                                closeAction: {
                                                    label: "Tidak, arahkan saya ke dalam pemesanan kamar",
                                                    handler: () => {
                                                        setShowPopUp(prev => {
                                                            return {
                                                                ...prev,
                                                                ...{
                                                                    orders: true
                                                                }
                                                            }
                                                        })
                                                    }
                                                },
                                                iShowed: true
                                            }, setShowAlertProps)
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
                            <button className="min-w-max h-15 font-bold text-background bg-(--status-refund) px-2 rounded-sm cursor-pointer"
                                onClick={() => {
                                    const isFound = orders.find((order) => order.room.id == currentRoom.id)
                                    if (isFound) {
                                        const newQty = isFound.quantity + 1
                                        if (newQty > Number(currentRoom.total_rooms)) {
                                            alert(`Kamar Ingin Memesan ${newQty} Kamar? Namun Kamar Hanya Tersisa ${currentRoom.total_rooms} Yang Tersedia`)
                                            return
                                        }
                                        isFound.quantity = newQty
                                        setOrders(prev => {
                                            return prev.map(order => {
                                                order.quantity = newQty
                                                return order
                                            })
                                        })
                                    } else {
                                        const order = {
                                            room: currentRoom,
                                            quantity: 1,
                                            checkIn: bookingDate.checkIn,
                                            checkOut: bookingDate.checkOut,
                                        } as OrderRoom
                                        setOrders(prev => {
                                            return [
                                                ...prev,
                                                ...[order]
                                            ]
                                        })
                                    }
                                    setCurrentRoom(null);
                                    SetShowAlertStateAction({
                                        title: "Berhasil Menambahkan Kamar Kedalam Pemesanan",
                                        description: "Apakah kamu ingin menambahkan kamar lain, kedalam pemesanan?",
                                        category: "success",
                                        actions: [
                                            {
                                                label: "Saya ingin menambahkan kamar lain",
                                                handler: () => { }
                                            }
                                        ],
                                        closeAction: {
                                            label: "Tidak, arahkan saya ke dalam pemesanan kamar",
                                            handler: () => {
                                                setShowPopUp(prev => {
                                                    return {
                                                        ...prev,
                                                        ...{
                                                            orders: true
                                                        }
                                                    }
                                                })
                                            }
                                        },
                                        iShowed: true
                                    }, setShowAlertProps)
                                }
                                }
                            >Pesan Kamar</button>
                            <div className="flex flex-col h-full justify-end text-end">
                                <span className="text-(--status-refund) font-bold">{totalRoomsLabel(currentRoom.total_rooms)}</span>
                                {Number(currentRoom.minimum_price) != 0 && <span className="line-through">{convertNumberIntoIDR(Number(currentRoom.default_price))} /Malam</span>}
                                <span className="text-lg text-(--status-refund) font-bold">{getCurrentPriceLabel(Number(currentRoom.default_price), Number(currentRoom.minimum_price))} /Malam</span>
                            </div>
                        </div>
                    </div>
                </div>}
            </div> : <div className="flex flex-col gap-2.5">
                <h2 className="text-2xl">Tidak Ada Kamar Yang Tersedia...</h2>
            </div>}

            <HotelAddress />

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

            <HotelFeedbacks feedbacks={dataHotel.feedbacks} />

            <HotelFaqs faqs={dataHotel.faqs} />

            {/* untuk menampilkan hotel - hotel yang mungkin anda suka */}
            {/* <div className="flex flex-col gap-4">
                <h2 className="font-bold text-xl">Kamu Mungkin Tertarik Dengan Tempat Bermalam Yang Lain</h2>
                <div className="flex gap-2.5 flex-wrap">
                    <div className="w-80 h-100">
                       
                    </div>
                </div>
            </div> */}

        </div>
        }


    </div >
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