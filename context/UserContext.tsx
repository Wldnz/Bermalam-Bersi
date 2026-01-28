"use client"
import { AxiosErrorCustom } from "@/models/Models"
import Api from "@/utils/Api"
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"

interface UserContextType {
    user: CurrentCredential | null
    Logout: () => void
    GetCurrentCredentials: () => void
    saveCredentials : ( data : CurrentCredential  | null) => void
}

interface CurrentCredential {
    id: number
    first_name: string
    last_name: string
    role: string
    email: string
    points: number
    verified: boolean
    status: string
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {

    const [user, setUser] = useState<CurrentCredential | null>(null)


    const Logout = () => {
        if(!user) return;
        logOutHandler(setUser);
    }

    const saveCredentials = ( data : CurrentCredential | null ) => {
        setUser(data)
    }

    const GetCurrentCredentials = () => {
        getCurrentCredentials(setUser)
    }

    useEffect(() => GetCurrentCredentials(), [])

    return <UserContext.Provider value={ { user, saveCredentials, GetCurrentCredentials, Logout } }>
        {children}
    </UserContext.Provider>

}

export function useUser() {
    const context = useContext(UserContext)
    if (context == undefined) {
        throw new Error("useUser must be used within UserProvicer")
    }
    return context
}

const getCurrentCredentials = async(setUser : Dispatch<SetStateAction<CurrentCredential | null>>)  => {
    try{
        const {  data } = await Api().get("/check-current-session");
        setUser(data.data)
    }catch{
        setUser(null)
    }
}


const logOutHandler = async(setUser : Dispatch<SetStateAction<CurrentCredential | null>>) => {
    try{
        await Api().get("/logout")
    }finally{
        setUser(null)
    }
}

const loginHandler = async(
    dataBody : object,
    setUser : Dispatch<SetStateAction<CurrentCredential | null>>
) => {
    try{
        const { data } = await Api().post("/sign-in", dataBody)
        setUser(data.data)
    }catch(err){
        const error = err as AxiosErrorCustom
        setUser(null)
    }
}