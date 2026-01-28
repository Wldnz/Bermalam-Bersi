"use client"
import { BookingState } from "@/components/FindHotel/models";
import { OrderRoom } from "@/models/Room";
import { createContext, useContext, useEffect, useState } from "react";

interface BookingContextType{
    bookingData: BookingState | null
    saveBooking: (data : BookingState | null) => void
    orders : OrderRoom[] | []
    saveOrders : (data : OrderRoom[] | []) => void 
}

interface CurrentCredential{
    id: number
    first_name: string
    last_name: string
    role: string
    email:string
    points:number
    verified: boolean
    status: string 
}

const BookingContext =  createContext<BookingContextType  | undefined>(undefined)

export function BookingProvider( { children } : { children: React.ReactNode } ){
    const [ bookingData, setBookingData ] = useState<BookingState | null>(null)

    const [ orders, setOrders ] = useState<OrderRoom[] | []>([])

    const saveBooking = ( data : BookingState | null) => {
        setBookingData(data)
        localStorage.setItem("temp_booking_data", JSON.stringify(data))
    }

    const saveOrders = ( data : OrderRoom[] | []) => {
        setOrders(data)
        localStorage.setItem("temp_orders_data", JSON.stringify(data))
    }


    useEffect(() => {
        const gettingBooking = () => {
            if(typeof window !== "undefined"){
                const rawBooking = localStorage.getItem("temp_booking_data") 
                const rawOrders = localStorage.getItem("temp_orders_data")   
                if(rawBooking){
                    setBookingData(JSON.parse(rawBooking))
                }else{
                    saveBooking(null)
                }
                 if(rawOrders){
                    setOrders(JSON.parse(rawOrders))
                }else{
                    saveOrders([])
                }
            }
        }   
        gettingBooking()
    }, [])

    return (
       <BookingContext.Provider  value={{ bookingData, saveBooking, orders, saveOrders}}>
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