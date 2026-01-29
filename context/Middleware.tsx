"use client"
import { createContext, ReactNode, useEffect } from "react";
import { useUser } from "./UserContext";
import { usePathname, useRouter } from "next/navigation";

// interface MiddlewareContextType{

// }

const MiddlewareContext = createContext<undefined>(undefined)

const proctectedURL = [
    "/vouchers",
    "/profile",
    "/transactions/history",
]

export function MiddlewareProvider({
    children,
}: {
    children: ReactNode
}) {

    const router = useRouter()

    const currentPahtName = usePathname()

    const { user, GetCurrentCredentials } = useUser();

    useEffect(() => {
        const abc = async () => {
            if (!user && router && currentPahtName) {
                // antara push atau buatkan halaman seperti kamu butuh login untuk mengakses halaman ini....
                const newUser = await GetCurrentCredentials()
                if (!newUser) {
                    proctectedURL.forEach(pathName => {
                        if (currentPahtName.startsWith(pathName)) {
                            return router.push("/")
                        }
                    });
                }
            }
        }

        // if(user && router && currentPahtName && currentPahtName.startsWith("/auth/sign-")){
        //     router.push("/")
        // }


    }, [currentPahtName, router, user])
    return <MiddlewareContext.Provider value={undefined}>
        {children}
    </MiddlewareContext.Provider>
}