"use client"
import { BookingState } from "@/components/FindHotel/models";
import { OrderRoom } from "@/models/Room";
import Api from "@/utils/Api";
import { createContext, useContext, useEffect, useState } from "react";

interface BookingContextType{
    bookingData: BookingState | null
    saveBooking: (data : BookingState) => void
    orders : OrderRoom[] | []
    saveOrders : (data : OrderRoom[] | []) => void 
    user : CurrentCredential | null
    saveUser : (data : CurrentCredential | null) => void
}

interface CurrentCredential{
    id: number
    first_name: string
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

    const [ user, setUser ] = useState<CurrentCredential | null>(null)

    const saveBooking = ( data : BookingState | null) => {
        setBookingData(data)
        localStorage.setItem("temp_booking_data", JSON.stringify(data))
    }

    const saveOrders = ( data : OrderRoom[] | []) => {
        setOrders(data)
        localStorage.setItem("temp_orders_data", JSON.stringify(data))
    }

    const saveUser = ( data : CurrentCredential | null ) => {
        setUser(data)
    }

    useEffect(() => {
        console.log("fetchnig....")
        const fetchCredentials = async() => {
            try{
                const { data } = await Api().get("/check-current-session")
                saveUser(data.data)
            }catch{
                saveUser(null)
            }
        }
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
        fetchCredentials()
    }, [])

    return (
       <BookingContext.Provider  value={{ bookingData, saveBooking, orders, saveOrders, user, saveUser }}>
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