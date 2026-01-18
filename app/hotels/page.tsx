"use client"
import FastMenuContainer from "@/components/FindHotel/FastMenuContainer";
import { BookingState } from "@/components/FindHotel/models";
import RecommendationPopulerDestination from "@/components/FindHotel/RecommendationDestination";
import HotelIcons from "@/components/Icons/Hotel";
import Navigation from "@/components/Navigation";
import Hotel from "@/models/Hotel";
import Api from "@/utils/Api";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";



export default function Hotels() {

    const searchParams = useSearchParams()

    const currentTime = new Date().getTime()

    const bookingData = {
        search: searchParams.get("search"),
        checkInDate: searchParams.get("check_in"),
        checkOutDate: searchParams.get("check_out"),
        totalAdults: searchParams.get("total_adults"),
        totalChildrens: searchParams.get("total_childrens"),
        totalRooms: searchParams.get("total_rooms"),
        category: searchParams.get("category_property"),
    }

    const [bookingDate, setBookingDate] = useState<BookingState>({
        search: bookingData.search ? bookingData.search : "",
        checkIn: bookingData.checkInDate ? Number(bookingData.checkInDate) : currentTime,
        checkOut: bookingData.checkOutDate ? Number(bookingData.checkOutDate) : currentTime + (60 * 60 * 24 * 1000),
        category: bookingData.category ? bookingData.category : "all",
        guests: {
            adults: bookingData.totalAdults ? Number(bookingData.totalAdults) : 1,
            childrens: bookingData.totalChildrens ? Number(bookingData.totalChildrens) : 0,
        },
        totalRooms: bookingData.totalRooms ? Number(bookingData.totalRooms) : 1,
    })

    function createQueryFindHotels() {
        const query = `search=${bookingDate.search}&category_property=${bookingDate.category}&check_in=${bookingDate.checkIn}&check_out=${bookingDate.checkOut}&total_adults=${bookingDate.guests.adults}&total_childrens=${bookingDate.guests.childrens}&total_rooms=${bookingDate.totalRooms}`
        return query
    }

    const [hotels, setHotels] = useState<Hotel[] | []>([]);

    useEffect(() => {

        const api = Api()

        const fetchHotels = async () => {
            const queryParams = createQueryFindHotels()

            try {
                const { status, data } = await api.get(`/hotels?${queryParams}`)
                if (status == 200) setHotels(data.data)
                console.log(data)
            } catch {
                setHotels([])
            }
        }

        fetchHotels()

    }, [])


    return <div className="flex flex-col gap-10">
        <div className="w-full h-full p-6">
            <Navigation border={true} />
        </div>
        <div className="w-full h-12 flex justify-center items-center bg-(--status-refund)"></div>
        <div className="p-3 flex flex-col gap-6">
            {/* title & layout structure */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg">Kami Menemukan 10 Tempat Bermalam Yang Cocok</h3>
                <div className="flex gap-5">
                    <button className="grid grid-cols-2 grid-rows-2 gap-1 cursor-pointer">
                        <div className="w-6 h-6 border-2 border-(--status-refund) rounded-lg"></div>
                        <div className="w-6 h-6 border-2 border-(--status-refund) rounded-lg"></div>
                        <div className="w-6 h-6 border-2 border-(--status-refund) rounded-lg"></div>
                        <div className="w-6 h-6 border-2 border-(--status-refund) rounded-lg"></div>
                    </button>
                    <button className="flex flex-col gap-1.5 cursor-pointer">
                        <div className="w-12 h-6 bg-(--status-refund) border-2 border-(--status-refund) rounded-lg"></div>
                        <div className="w-12 h-6 bg-(--status-refund) border-2 border-(--status-refund) rounded-lg"></div>
                    </button>
                </div>
            </div>
            {/* hotels here */}
            <div className="flex flex-col gap-2.5">
                { hotels.map((hotel, i) => {
                    return <DefaultHotelCard key={`hotel-name-${hotel.name}-${i}`} hotel={hotel} />
                }) }

            </div>
        </div>
        <RecommendationPopulerDestination />
        <FastMenuContainer />
    </div>
}

function DefaultHotelCard({ hotel } : { hotel : Hotel }) {
    return <div className="p-3 flex gap-3.5 hover:border-2 border-(--status-refund) rounded-2xl">
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
                { Array(Number(hotel.stars)).fill(null).map((v, i) => {
                    return <HotelIcons key={`stars-${i}`} className="w-5 h-5 text-(--status-wait)" name="star" />
                }) }
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
        <div className="w-full flex flex-col justify-between items-end">
            <span className="p-1.5 px-2 text-center text-background font-bold bg-(--status-refund) rounded-lg">Diskon 20%</span>
            <div className="flex flex-col items-end gap-2.5">
                <h4 className="font-bold text-(--status-refund)">{totalRoomsLabel(Number(hotel.total_rooms))}</h4>
                <p className="line-through">{hotel.default_price}</p>
                <h3 className="font-bold text-(--status-refund) text-2xl">{getCurrentPriceLabel( Number(hotel.default_price), Number(hotel.minimum_price) )}</h3>
                <button className="w-full p-3 font-bold text-background bg-(--status-refund) cursor-pointer rounded-sm">Lihat Kamar</button>
            </div>
        </div>
    </div>
}

function totalRoomsLabel(total : number){
    let label = "Kamar Terakhir"
    if (total > 1) label = `${total} Kamar Tersedia`
    return label
}

function getCurrentPriceLabel(
    defaultPrice : number,
    minimumPrice : number
){
    if (minimumPrice <= 0) return convertNumberIntoIDR(defaultPrice)
    return convertNumberIntoIDR(minimumPrice)
}

function convertNumberIntoIDR( price : number ){
    return new Intl.NumberFormat(
        'id-ID',
        {
            style : "currency",
            currency : "IDR"
        }
    ).format(price)
}

function getCurrentDiscountLabel( defaultPrice : number, minimumPrice : number ){
    if (minimumPrice == 0){
        
    }
    return {

    }
}