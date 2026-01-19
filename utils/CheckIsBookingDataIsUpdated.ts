import { BookingState } from "@/components/FindHotel/models"

export default function isDataHasBeenUpdate(defaultBookingDate: BookingState, bookingDate: BookingState) {
    // if (defaultBookingDate.search != bookingDate.search) return true
    if (!checkIsTheDaySameOrSameMonth(defaultBookingDate.checkIn, bookingDate.checkIn)) return true
    if (!checkIsTheDaySameOrSameMonth(defaultBookingDate.checkOut, bookingDate.checkOut)) return true
    if (defaultBookingDate.guests.adults != bookingDate.guests.adults) return true
    if (defaultBookingDate.guests.childrens != bookingDate.guests.childrens) return true
    if (defaultBookingDate.totalRooms != bookingDate.totalRooms) return true
    if (defaultBookingDate.category != bookingDate.category) return true
    return false
}

function checkIsTheDaySameOrSameMonth(date1: number, date2: number) {
    const currenDate1 = new Date(date1)
    const currentDate2 = new Date(date2)
    return currenDate1.getDate() == currentDate2.getDate() && currenDate1.getMonth() == currentDate2.getMonth()
}