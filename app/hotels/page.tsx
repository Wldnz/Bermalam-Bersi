"use client"
import { BookingState } from "@/components/FindHotel/models";
import Navigation from "@/components/Navigation";
import Api from "@/utils/Api";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Hotel {
    id:number
    name:string
    description:string
    stars:string
    default_price:string
    minimum_price:string
    total_rooms:string
    image_url:string
}

export default function Hotels() {

    const searchParams = useSearchParams()

    const currentTime = new Date().getTime()

    const bookingData = {
        search : searchParams.get("search"),
        checkInDate : searchParams.get("check_in"),
        checkOutDate : searchParams.get("check_out"),
        totalAdults : searchParams.get("total_adults"),
        totalChildrens : searchParams.get("total_childrens"),
        totalRooms : searchParams.get("total_rooms"),
        category : searchParams.get("category_property"),
    }

    const [ bookingDate, setBookingDate ] = useState<BookingState>({
            search : bookingData.search? bookingData.search : "",
            checkIn: bookingData.checkInDate? Number(bookingData.checkInDate) : currentTime,
            checkOut: bookingData.checkOutDate? Number(bookingData.checkOutDate) : currentTime + (60 * 60 * 24 * 1000),
            category : bookingData.category? bookingData.category : "all",
            guests: {
                adults: bookingData.totalAdults? Number(bookingData.totalAdults) : 1,
                childrens: bookingData.totalChildrens? Number(bookingData.totalChildrens) : 0,
            },
            totalRooms: bookingData.totalRooms? Number(bookingData.totalRooms) : 1,
    })

    function createQueryFindHotels() {
    const query = `search=${bookingDate.search}&category_property=${bookingDate.category}&check_in=${bookingDate.checkIn}&check_out=${bookingDate.checkOut}&total_adults=${bookingDate.guests.adults}&total_childrens=${bookingDate.guests.childrens}&total_rooms=${bookingDate.totalRooms}`
    return query
  }

    const [ hotel, setHotels ] = useState<Hotel[] | []>([]);

    useEffect(() => {
        
        const api = Api()

        const fetchHotels = async() => {
            const queryParams = createQueryFindHotels()
            
            try{
                const { status, data } = await api.get(`/hotels?${queryParams}`)
                if (status == 200) setHotels(data.data)
                console.log(data)
            }catch{
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
        <div className="p-3">
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
                {/* hotel here */}
                <div className="flex gap-1.5">
                        {/* iamge */}
                        {/* <Image> */}
                        <div className="flex flex-col ">
                            <h3>Hotel AmenKila | Luxury Hotels</h3>
                            {/* stars */}
                            <div className="flex gap-2.5">
                                {/* stars */}
                                <p> | Sangat Baik</p>
                            </div>
                            <div className="flex gap-2.5">
                                <span className="p-1 bg-(--status-refund) text-background rounded-xl">Hotel</span>
                                <span className="p-1 bg-(--status-refund) text-background rounded-xl">Luxury Hotel</span>
                                <span className="p-1 bg-(--status-refund) text-background rounded-xl">5 Stars</span>
                            </div>
                            <p>Hotel AmanKila hadir dalam menyiapkan tempat penginapan yang nyaman disertai dengan pemandangan yang luar biasa</p>
                        </div>
                        {/* prices */}
                        <div className="flex flex-col justify-between">
                            <span className="p-1 text-background font-bold bg-(--status-refund)">Diskon 20%</span>
                            <div className="flex flex-col gap-2.5">
                                <h4 className="font-bold text-(--status-refund)">4 Kamar Tersedia</h4>
                                <p className="line-through">Rp. 900.000,00</p>
                                <h3 className="font-bold text-(--status-refund)">Rp. 875.000,00</h3>
                                <button className="font-bold text-background rounded-lg">Lihat Kamar</button>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </div>
}