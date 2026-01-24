"use client"
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileNavigationSide from "./ProfileNavigationSide";
import { AuthSession } from "@/models/Models";
import GetCurrentSession from "@/lib/CurrentSession";
import NavigationIcons from "@/lib/icons/NavigationIcons";

export default function NavigationSide() {

    const pathName = usePathname();

    const router = useRouter();

    const [currentLocation, setCurrentLocation] = useState<string>(pathName?.split('/')[1]);

    const [user, setUser] = useState<AuthSession>({
        is_authorize : false
    } as AuthSession)

    useEffect(() => {
        const getData = async () => {
            const data = await GetCurrentSession();
            if(data.is_authorize){
                setUser(data)
            }else{
                router.push('/signin')
            }
        }
        getData();
    },[])

    const navigationList = [
        {
            "name": "dashboard",
            "label": "Dashboard",
            "icon_name": "ic_home",
            "destination": "/dashboard",
        },
        {
            "name": "account",
            "label": "Management Akun",
            "icon_name": "ic_account_outline",
            "destination": "/accounts",
        },
        {
            "name": "hotel",
            "label": "Management Hotel",
            "icon_name": "ic_hotel",
            "destination": "/hotels",
        },
        {
            "name": "orders",
            "label": "Management Pesanan",
            "icon_name": "ic_invoice",
            "destination": "/orders",
        },
        {
            "name": "transaction",
            "label": "Management Transaksi",
            "icon_name": "ic_invoice",
            "destination": "/transactions",
        },
        {
            "name": "voucher",
            "label": "Management Kupon",
            "icon_name": "ic_voucher",
            "destination": "/vouchers",
        },
        {
            "name": "sanction",
            "label": "Management Sanksi",
            "icon_name": "ic_punishment",
            "destination": "/sanctions",
        },
        {
            "name": "faq",
            "label": "Management Faq",
            "icon_name": "ic_faq",
            "destination": "/faq",
        },
        {
            "name": "setting",
            "label": "Settings",
            "icon_name": "ic_setting",
            "destination": "/settings",
        },
    ]

    return <aside className="w-80 h-dvh flex flex-col gap-10 p-5 bg-background font-inter">
        <ProfileNavigationSide user={user} />
        <div className="w-full flex flex-col gap-2.5">
            {navigationList.map((navigation, index) => {
                return (<NavigationBar
                    key={`${navigation.name}-${index}`}
                    name={navigation.name}
                    label={navigation.label}
                    currentLocation={currentLocation}
                    setCurrentLocation={setCurrentLocation}
                    destination={navigation.destination}
                />)
            })}
        </div>
    </aside> 
}



function NavigationBar({
    name,
    destination,
    label,
    currentLocation,
    setCurrentLocation
}: {
    label: string,
    name: string,
    destination: string,
    currentLocation: string,
    setCurrentLocation: React.Dispatch<React.SetStateAction<string>>
}) {
    return (
        <Link
            className={`w-full h-10 flex justify-between items-center gap-3 ${currentLocation == name ? "bg-(--b1)" : "bg-none"} rounded-lg p-1.5`}
            href={destination}
            onClick={() => setCurrentLocation(name)}
        >
            <div className="w-9 h-7 flex items-center justify-center bg-background rounded-lg">
                <NavigationIcons name={name} className="w-6 h-6 text-(--b1)" />
            </div>
            <span className={`w-full ${currentLocation == name ? "text-background font-bold" : "text-(--b1)"} text-sm`}>{label}</span>
        </Link>
    )
}