import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { Dispatch, SetStateAction } from "react"
import Api from "./Api"

export default async function LoginOrRegisterWithGoogle(
    router : AppRouterInstance,
    setErrorMessage  : Dispatch<SetStateAction<string>>
) {
        try{
            const { data } = await Api().post("/sign-in-google")
            router.push(data.data.url)
        }catch{
            setErrorMessage("Gagal Menghubungkan Dengan Google, Coba Lagi Nanti Ya!")
        }
    }