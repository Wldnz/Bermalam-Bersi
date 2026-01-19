import { Dispatch, SetStateAction } from "react"
import Api from "./Api"
import CreateQueryFindHotels from "./CreateQueryFindHotels"
import Hotel from "@/models/Hotel"
import { BookingState } from "@/components/FindHotel/models"

 export default async function FetchHotels(
        setHotels: Dispatch<SetStateAction<Hotel[] | []>>,
        bookingDate : BookingState
    ) {
        try {
            const { status, data } = await Api().get(`/hotels?${CreateQueryFindHotels(bookingDate)}`)
            if (status == 200) setHotels(data.data)
        } catch {
            setHotels([])
        }
    }