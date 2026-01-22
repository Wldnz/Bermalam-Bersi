"use client"
import { BookingState } from "@/components/FindHotel/models";
import { OrderRoom } from "@/models/Room";
import { createContext, useContext, useState } from "react";

interface BookingContextType{
    bookingData: BookingState | null
    saveBooking: (data : BookingState) => void
    orders : OrderRoom[] | []
    saveOrders : (data : OrderRoom[] | []) => void 
}

const BookingContext =  createContext<BookingContextType  | undefined>(undefined)

export function BookingProvider( { children } : { children: React.ReactNode } ){
    const [ bookingData, setBookingData ] = useState<BookingState | null>(null)
    4
    const [ orders, setOrders ] = useState<OrderRoom[] | []>([])

    // const [ user, setUser ] =

    const saveBooking = ( data : BookingState ) => {
        setBookingData(data)
    }

    const saveOrders = ( data : OrderRoom[] | []) => {
        setOrders(data)
    }

    return (
       <BookingContext.Provider  value={{ bookingData, saveBooking, orders, saveOrders }}>
        { children }
       </BookingContext.Provider>
    )

}

export function useBooking(){
    const context = useContext(BookingContext)
    if(context == undefined){
        throw new Error("useBooking must be used within BookingProvider")
    }
    return context
}