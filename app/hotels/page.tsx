"use client"
import CategoryProperty from "@/components/FindHotel/CategoryProperty";
import FastMenuContainer from "@/components/FindHotel/FastMenuContainer";
import FindHotelVoucher from "@/components/FindHotel/HotelVoucher";
import { BookingState } from "@/components/FindHotel/models";
import RecommendationPopulerDestination from "@/components/FindHotel/RecommendationDestination";
import SearchHotelBar from "@/components/FindHotel/SearchHotelsBar";
import ActionIcon from "@/components/Icons/Action";
import HotelIcons from "@/components/Icons/Hotel";
import TransactionIcons from "@/components/Icons/Transactions";
import Navigation from "@/components/Navigation";
import Hotel from "@/models/Hotel";
import isDataHasBeenUpdate from "@/utils/CheckIsBookingDataIsUpdated";
import convertNumberIntoIDR from "@/utils/ConvertNumberToIDR";
import FetchHotels from "@/utils/FetchHotels";
import { getCurrentPriceLabel, totalRoomsLabel } from "@/utils/HotelPrice";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";



export default function Hotels() {

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

    const [showUpdatedData, setShowUpdatedData] = useState<boolean>(isDataHasBeenUpdate(defaultBookingDate, bookingDate))

    const [isDefaultCard, setIsDefaultCard] = useState<boolean>(false)


    const [hotels, setHotels] = useState<Hotel[] | []>([]);

    useEffect(() => {
        FetchHotels(setHotels, bookingDate)
     }, [])

    return <div className="flex flex-col gap-10">
        
        <Navigation />
        
        <div className="w-full h-16 flex justify-center items-center bg-(--status-refund)">
            <CategoryProperty setValue={setBookingDate} value={bookingDate} />
        </div>

        <div className="flex flex-col gap-3">
            <SearchHotelBar setValue={setBookingDate} value={bookingDate} defaultValue={defaultBookingDate} setHotels={setHotels} isUpdatedData={showUpdatedData} setIsUpdatedData={setShowUpdatedData} />
            <div className="w-full flex justify-center items-center gap-2.5">
                <button className="p-1.5 px-3 bg-(--status-refund) border-2 border-(--status-refund) font-bold text-background text-sm rounded-xl cursor-pointer">Semuanya</button>
                <button className="p-1.5 px-3 font-bold text-(--status-refund) border-2 border-(--status-refund) text-sm rounded-xl cursor-pointer">Termurah</button>
                <button className="p-1.5 px-3 font-bold text-(--status-refund) border-2 border-(--status-refund) text-sm rounded-xl cursor-pointer">Bintang Lima</button>
                <button className="p-1.5 px-3 font-bold text-(--status-refund) border-2 border-(--status-refund) text-sm rounded-xl cursor-pointer">Refundable</button>
            </div>
        </div>

        <FindHotelVoucher />

        <div className="p-3 flex flex-col gap-6">
            {/* title & layout structure */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg">{
                    !hotels.length ? "Tidak Menemukan Tempat Bermalam Yang Tersedia!" : `Kami Menemukan ${hotels.length} Tempat Bermalam Yang Cocok`
                }</h3>
                <div className="flex gap-5">
                    <button className="grid grid-cols-2 grid-rows-2 gap-1 cursor-pointer"
                        onClick={() => setIsDefaultCard(false)}
                    >
                        <div className={`w-6 h-6 border-2 ${isDefaultCard ? "" : "bg-(--status-refund)"} border-(--status-refund) rounded-lg`}></div>
                        <div className={`w-6 h-6 border-2 ${isDefaultCard ? "" : "bg-(--status-refund)"} border-(--status-refund) rounded-lg`}></div>
                        <div className={`w-6 h-6 border-2 ${isDefaultCard ? "" : "bg-(--status-refund)"} border-(--status-refund) rounded-lg`}></div>
                        <div className={`w-6 h-6 border-2 ${isDefaultCard ? "" : "bg-(--status-refund)"} border-(--status-refund) rounded-lg`}></div>
                    </button>
                    <button className="flex flex-col gap-1.5 cursor-pointer"
                        onClick={() => setIsDefaultCard(true)}
                    >
                        <div className={`w-12 h-6 ${isDefaultCard ? "bg-(--status-refund)" : ""} border-2 border-(--status-refund) rounded-lg`}></div>
                        <div className={`w-12 h-6 ${isDefaultCard ? "bg-(--status-refund)" : ""} border-2 border-(--status-refund) rounded-lg`}></div>
                    </button>
                </div>
            </div>
            {isDefaultCard ? <DefaultHotelCards hotels={hotels} /> : <SecondHotelsCard hotels={hotels} />
            }
        </div>
        <RecommendationPopulerDestination />
        <FastMenuContainer />
    </div>
}

function DefaultHotelCards({ hotels }: { hotels: Hotel[] }) {
    return <div className="flex flex-col gap-2.5">
        {hotels.length ?
            hotels.map((hotel, i) => {
                return <DefaultHotelCard key={`hotel-name-${hotel.name}-${i}`} hotel={hotel} />
            }) : <HotelNotFound />
        }
    </div>
}

function SecondHotelsCard({ hotels }: { hotels: Hotel[] }) {
    return <div className="w-full flex items-center gap-2.5">
        {hotels.length ? hotels.map((hotel, index) => {
            return <SecondtHotelCard hotel={hotel} key={index} />
        }) : <HotelNotFound />}
    </div>
}

function SecondtHotelCard({ hotel }: { hotel: Hotel }) {

    const price = {
        default: Number(hotel.default_price),
        minimum: Number(hotel.minimum_price),
        totalRooms: Number(hotel.total_rooms),
        discount: 0,
        discountLabel: "",
        priceLabel: "",
        roomLabel: "",
    }

    price.roomLabel = totalRoomsLabel(price.totalRooms)
    price.priceLabel = getCurrentPriceLabel(price.default, price.minimum)
    price.discount = (price.default - price.minimum) / price.default * 100
    price.discountLabel = `${price.discount}%`


    return <Link className="flex flex-col gap-3.5 hover:border-2 border-(--status-refund) rounded-2xl p-2"
        href={`/hotels/${hotel.id}`}
    >
        <Image
            className="rounded-lg"
            width={300}
            height={20}
            src={hotel.image_url}
            alt={`hotel-name${hotel.name}`}
        />
        <div className="flex flex-col gap-2.5 px-1">
            <h3 className="font-bold text-xl">{hotel.name}</h3>
            <div className="flex items-center gap-2.5">
                {Array(Number(hotel.stars)).fill(null).map((v, i) => {
                    return <HotelIcons key={`stars-${i}`} className="w-4 h-4 text-(--status-wait)" name="star" />
                })}
                <p className="text-sm"> | Sangat Baik</p>
            </div>
            <div className="flex gap-2.5">
                <span className="p-1 px-3 bg-(--status-refund) text-background text-xs rounded-xl">Hotel</span>
                <span className="p-1 px-3 bg-(--status-refund) text-background text-xs rounded-xl">Luxury</span>
                <span className="p-1 px-3 bg-(--status-refund) text-background text-xs rounded-xl">5 Star</span>
            </div>
        </div>
        {/* prices */}
        <div className={`w-full flex flex-col ${price.minimum != 0 ? "justify-between" : "justify-end"} items-end`}>
            {price.minimum != 0 && <span className="p-1.5 px-2 text-center text-background font-bold bg-(--status-refund) rounded-lg">{price.discountLabel}</span>}
            <div className="flex flex-col items-end gap-2.5">
                <h4 className="font-bold text-(--status-refund)">{price.roomLabel}</h4>
                {price.minimum != 0 && <p className="line-through">{convertNumberIntoIDR(price.default)}</p>}
                <h3 className="font-bold text-(--status-refund) text-xl">{price.priceLabel}</h3>
                <button className="w-full p-3 font-bold text-background bg-(--status-refund) cursor-pointer rounded-sm">Lihat Kamar</button>
            </div>
        </div>
    </Link>
}

function DefaultHotelCard({ hotel }: { hotel: Hotel }) {

    const price = {
        default: Number(hotel.default_price),
        minimum: Number(hotel.minimum_price),
        totalRooms: Number(hotel.total_rooms),
        discount: 0,
        discountLabel: "",
        priceLabel: "",
        roomLabel: "",
    }

    price.roomLabel = totalRoomsLabel(price.totalRooms)
    price.priceLabel = getCurrentPriceLabel(price.default, price.minimum)
    price.discount = (price.default - price.minimum) / price.default * 100
    price.discountLabel = `${price.discount}%`


    return <Link className="p-3 flex gap-3.5 hover:border-2 border-(--status-refund) rounded-2xl"
        href={`/hotels/${hotel.id}`}
    >
        <Image
            className="h-60 rounded-lg"
            width={300}
            height={20}
            src={hotel.image_url}
            alt={`hotel-name${hotel.name}`}
        />
        <div className="w-[65%] flex flex-col gap-2.5">
            <h3 className="font-bold text-xl">{hotel.name}</h3>
            <div className="flex items-center gap-2.5">
                {Array(Number(hotel.stars)).fill(null).map((v, i) => {
                    return <HotelIcons key={`stars-${i}`} className="w-5 h-5 text-(--status-wait)" name="star" />
                })}
                <p> | Sangat Baik</p>
            </div>
            <div className="flex gap-2.5">
                <span className="p-1 px-3 bg-(--status-refund) text-background rounded-xl">Hotel</span>
                <span className="p-1 px-3 bg-(--status-refund) text-background rounded-xl">Luxury</span>
                <span className="p-1 px-3 bg-(--status-refund) text-background rounded-xl">5 Star</span>
            </div>
            <p className="max-w-100">{hotel.description}</p>
        </div>
        {/* prices */}
        <div className={`w-full flex flex-col ${price.minimum != 0 ? "justify-between" : "justify-end"} items-end`}>
            {price.minimum != 0 && <span className="p-1.5 px-2 text-center text-background font-bold bg-(--status-refund) rounded-lg">{price.discountLabel}</span>}
            <div className="flex flex-col items-end gap-2.5">
                <h4 className="font-bold text-(--status-refund)">{price.roomLabel}</h4>
                {price.minimum != 0 && <p className="line-through">{convertNumberIntoIDR(price.default)}</p>}
                <h3 className="font-bold text-(--status-refund) text-2xl">{price.priceLabel}</h3>
                <button className="w-full p-3 font-bold text-background bg-(--status-refund) cursor-pointer rounded-sm">Lihat Kamar</button>
            </div>
        </div>
    </Link>
}



function HotelNotFound() {
    return <div className="w-full h-dvh flex flex-col items-center gap-10 p-5">
        <ActionIcon className="w-35 h-35 text-(--status-refund)" name="close_outline" />
        <div className="flex flex-col items-center gap-2.5">
            <h2 className="font-bold text-xl text-(--status-refund)">Maaf Kami Tidak Dapat Menemukan Hotel Yang Anda Cari</h2>
            <p>Maaf, Kami tidak menemukan tempat bermalam yang sesuai dengan kebutuhan akomodasi anda</p>
        </div>
    </div>
}