"use client"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { BookingState, RecomendationText, RecomendationTextResponse } from "./models"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"
import Api from "@/utils/Api"
import ActionIcon from "../Icons/Action"
import CreateQueryFindHotels from "@/utils/CreateQueryFindHotels"
import BookingDate from "./BookingDate"

export default function RecommendationSearch({
    setValue,
    value,
}: {
    setValue: Dispatch<SetStateAction<BookingState>>,
    value: BookingState
}) {
    const router = useRouter()
    const [recommendation, setRecommendation] = useState<RecomendationText | null>(null)
    const [searchDebounce] = useDebounce(value.search, 500)

    useEffect(() => {
        getRecommendationTexts(searchDebounce, setRecommendation)
    }, [searchDebounce])

    return <div className={`w-full p-1.5 ${recommendation?.locations?.length || recommendation?.hotels?.length ? "flex" : "hidden"} flex-col gap-2.5 bg-white border-2 border-(--status-refund) absolute top-14 left-0 rounded-2xl`}
    id="recommendation-location">
        {
            recommendation?.locations.map(location => {
                return location.cities.map((city, index) => {
                    return <div
                        key={`${city}-recommendation-text-${index}`}
                        id={`${city}-recommendation-text-${index}`}
                        className="w-full p-1.5 text-start flex justify-between items-center cursor-pointer"
                    >
                        <button className="w-full text-start"
                            title={`recommendtion-search-${city}`}
                            onClick={() => {
                                setValue(prev => {
                                    return {
                                        ...prev,
                                        ...{
                                            search: city
                                        }
                                    }
                                })
                                setRecommendation(null)
                            }}
                        >{city + ", " + location.province}</button>
                        <button
                            title="remove recommendation location"
                            onClick={() => { 
                                removeRecommendation(city, true, setRecommendation)
                            }}
                        >
                            <ActionIcon className="w-5 h-5 text-(--status-refund)" name="close_tight" />
                        </button>
                    </div>
                })
            })}
        {
            recommendation?.hotels.map((hotel, index) => {
                return <div
                    key={`${hotel.label}-recommendation-text-${index}`}
                    id={`${hotel.label}-recommendation-text-${index}`}
                    className="w-full p-1.5 flex justify-between items-center text-start cursor-pointer"
                    title={`recommendtion-search-hotel-${hotel.label}`
                    }

                >
                    <button className="w-full text-start"
                        title={`recommendtion-search-${hotel.label}`}
                        onClick={() => {
                            router.push(`/hotels/${hotel.id}?${CreateQueryFindHotels(value)}`)
                            setRecommendation(null)
                        }}
                    >{hotel.label}</button>
                    <button className="" 
                        title="remove recommendation hotel-name"
                            onClick={() => { 
                                removeRecommendation(hotel.label, false, setRecommendation)
                            }
                        }
                    >
                        <ActionIcon className="w-5 h-5 text-(--status-refund)" name="close_tight" />
                    </button>
                </div>
            })
        }
    </div>
}

async function getRecommendationTexts(
    value: string,
    setValue: Dispatch<SetStateAction<RecomendationText | null>>
) {
    if (value.length < 3 || value.trim() === "") return setValue(null)

    try {
        const { status, data } = await Api().get(`/hotel-recomendation-name?search=${value}`)

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

            setValue({
                hotels: hotels,
                locations: locations,
            })

        }

    } catch {
        setValue(null)
    }
}

function removeRecommendation(
        value : string,
        isLocation : boolean,
        setValue : Dispatch<SetStateAction<RecomendationText | null>>
    ){  
        setValue(prev => {
            if (!prev) return prev
            if (isLocation){
                prev.locations = prev.locations.map(l => {
                    l.cities = l.cities.filter(c => c != value)
                    return l
                })
            }else{
                prev.hotels = prev.hotels.filter(h => h.label != value)
            }
            prev.locations  = prev.locations.filter(l => l.cities.length != 0)
            return prev
        })
}
