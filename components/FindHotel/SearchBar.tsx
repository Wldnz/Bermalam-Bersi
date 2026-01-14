import { Dispatch, FormEventHandler, SetStateAction } from "react"
import ActionIcon from "../Icons/Action"
import { BookingState, RecomendationText } from "./models"

export default function SearchBar({
    recomendation,
    bookingData,
    setBookingData,
    setRecommendation,
    handleSubmit
} : {
    recomendation: RecomendationText | null | undefined,
    bookingData : BookingState,
    setBookingData: Dispatch<SetStateAction<BookingState>>,
    setRecommendation : Dispatch<SetStateAction<RecomendationText | null | undefined>>,
    handleSubmit : FormEventHandler<HTMLFormElement> | undefined
}) {
    return <form className="w-full p-3 flex items-center gap-2.5 rounded-2xl rounded-tl-none bg-background relative"
        onSubmit={handleSubmit}
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
        <div className={`w-full p-1.5 ${recomendation?.locations?.length ? "flex" : "hidden"} flex-col gap-2.5 bg-background absolute top-10 left-0 rounded-b-2xl`}>
            {recomendation?.locations.map(location => {
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
                recomendation?.hotels.map((hotel, index) => {
                    return <button
                        key={`${hotel.label}-recommendation-text-${index}`}
                        className="w-full p-1.5 text-start cursor-pointer"
                        title={`recommendtion-search-hotel-${hotel}`}
                        onClick={() => {
                            // pindahkan ke halaman detail hotel...
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