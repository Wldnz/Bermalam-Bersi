"use client"

import Api from "@/utils/Api"
import GetRedirectURLParams from "@/utils/GetRedirectURL"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function GoogleAuthCallBack() {

    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectURL = GetRedirectURLParams(searchParams)
    const [currentQueryParams, setCurrentQueryParams] = useState<string>("")

    useEffect(() => {
        const fetchingURL = async () => {
           try{
             if (typeof window !== 'undefined') {
                setCurrentQueryParams(location.href.split(location.origin)[1])
                await Api().get(`${location.href.split(location.origin)[1]}`)
                router.push(redirectURL)
            }
           }catch{
                router.push("/auth/sign-in")
           }
        }
        fetchingURL()
    }, [])

    if (!currentQueryParams){
        return <div>loading....</div>
    }

    


    return <div>
        <h2 className="font-bold">Hello, ini adalah call back untuk menanagi google api ya!</h2>
        <span className="">current Path : {currentQueryParams}</span>
    </div>
}