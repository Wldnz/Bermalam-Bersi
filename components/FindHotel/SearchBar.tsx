"use client"
import { Dispatch, FormEventHandler, SetStateAction, useEffect, useState } from "react"
import ActionIcon from "../Icons/Action"
import { BookingState, RecomendationText, RecomendationTextResponse } from "./models"
import Api from "@/utils/Api"
import { useDebounce } from "use-debounce"
import { useRouter } from "next/navigation"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import CreateQueryFindHotels from "@/utils/CreateQueryFindHotels"

export default function SearchBar({
    bookingData,
    setBookingData,
}: {
    bookingData: BookingState,
    setBookingData: Dispatch<SetStateAction<BookingState>>,
}) {

    const router = useRouter()

    const [recommendation, setRecommendation] = useState<RecomendationText | null>()
    const [searchDebounce] = useDebounce(bookingData.search, 500)

    useEffect(() => {

        const fetchApiRecommendation = async () => {

            if (searchDebounce.length < 3 || searchDebounce.trim() === "") return setRecommendation(null)

            try {
                const { status, data } = await Api().get(`/hotel-recomendation-name?search=${searchDebounce}`)

                // recomendations

                if (status == 200 && (data.data as RecomendationTextResponse[]).length > 0) {
                    const locationMaps = new Map()

                    const datas = (data.data as RecomendationTextResponse[]);

                    datas.forEach((recomendation) => {

                        if (!locationMaps.has(recomendation.province)) {
                            locationMaps.set(recomendation.province, new Set())
                        }

                        locationMaps.get(recomendation.province).add(recomendation.city)
                    })

                    const locations = Array.from(locationMaps.entries()).map(location => ({
                        province: location[0] as string,
                        cities: Array.from(location[1]) as string[],
                    }))

                    const hotels = datas.map(data => ({
                        id: data.hotel_id,
                        label: data.label,
                    }))

                    setRecommendation({
                        hotels: hotels,
                        locations: locations,
                    })

                }

            } catch {
                setRecommendation(null)
            }

        }

        fetchApiRecommendation()

    }, [searchDebounce])

    return <form className="w-full p-3 flex items-center gap-2.5 rounded-2xl rounded-tl-none bg-background relative"
        onSubmit={(e) => handleSubmit(e, router, bookingData)}
    >
        <ActionIcon
            name="search"
            className="w-8 h-8 text-(--status-refund)"
        />
        <input
            className="w-full min-h-8 outline-none"
            placeholder="Cari Hotel Atau Lokasi Hotel Disini!"
            type="text"
            value={bookingData.search}
            onChange={(e) => setBookingData(prev => {
                return {
                    ...prev,
                    ...{
                        search: e.target.value
                    }
                }
            })}
        />
        <div className={`w-full p-1.5 ${recommendation?.locations?.length ? "flex" : "hidden"} flex-col gap-2.5 bg-background absolute top-10 left-0 rounded-b-2xl`}>
            {recommendation?.locations.map(location => {
                return location.cities.map((city, index) => {
                    return <button
                        key={`${city}-recommendation-text-${index}`}
                        className="w-full p-1.5 text-start cursor-pointer"
                        title={`recommendtion-search-${city}`}
                        onClick={() => {
                            setBookingData(prev => {
                                return {
                                    ...prev,
                                    ...{
                                        search: city
                                    }
                                }
                            })
                            setRecommendation(null)
                        }}
                    >
                        {city + ", " + location.province}
                    </button>
                })
            })}
            {
                recommendation?.hotels.map((hotel, index) => {
                    return <button
                        key={`${hotel.label}-recommendation-text-${index}`}
                        className="w-full p-1.5 text-start cursor-pointer"
                        title={`recommendtion-search-hotel-${hotel}`}
                        onClick={() => {
                            router.push(`/hotels/${hotel.id}`)
                            setRecommendation(null)
                        }}
                    >
                        {hotel.label}
                    </button>
                })
            }
        </div>
    </form>
}

function handleSubmit(e: React.FormEvent, router: AppRouterInstance, bookingData: BookingState) {
    e.preventDefault()
    router.push(`hotels?${CreateQueryFindHotels(bookingData)}`)
}

