import { BookingState } from "@/components/FindHotel/models"

export default function CreateQueryFindHotels(bookingData: BookingState) {
    const query = `search=${bookingData.search}&category_property=${bookingData.category}&check_in=${bookingData.checkIn}&check_out=${bookingData.checkOut}&total_adults=${bookingData.guests.adults}&total_childrens=${bookingData.guests.childrens}&total_rooms=${bookingData.totalRooms}`
    return query
}