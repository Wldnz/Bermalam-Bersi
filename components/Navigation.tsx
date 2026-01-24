
"use client"
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import BookingIcons from "./Icons/Booking";
import ActionIcon from "./Icons/Action";
import { useBooking } from "@/context/Booking";
import Api from "@/utils/Api";

interface NavigationLinkProps {
    name: string,
    label: string,
    href: string,
}

const navigationLink = [
    {
        name: "",
        label: "Halaman Utama",
        href: "/",
    },
    {
        name: "hotels",
        label: "Hotel",
        href: "/hotels",
    },
    {
        name: "vouchers",
        label: "Kupon & Diskon",
        href: "/vouchers",
    },
    {
        name: "faqs",
        label: "Bantuan & Dukungan",
        href: "/faqs",
    },
]

export default function Navigation({
    border = true,
    currency = true,
    showNavigation = true
}: {
    border?: boolean,
    currency?: boolean,
    showNavigation?: boolean,
}) {
    return <div className="w-full flex flex-col gap-5 px-4">
        {currency && <div className="w-full min-h-10 flex justify-end items-center gap-4">
            <button className="p-2 bg-(--status-refund) text-background text-xs rounded-b-xl cursor-pointer">Mata Uang : Rupiah</button>
            <button className="p-2 bg-(--status-refund) text-background text-xs rounded-b-xl cursor-pointer">Bahasa : Indonesia</button>
        </div>}
        {showNavigation && <NavigationBar border={border} />}
    </div>
}

function NavigationBar({
    border = false
}: {
    border: boolean
}) {

    const pathName = usePathname()

    const router = useRouter()

    const [showNavigation, setShowNavigation] = useState<boolean>(true)

    const [ showSettings,  setShowSettings ] = useState<boolean>(false)

    const { user } = useBooking()

    const HandleLogout = async() => {
        try{
            const { status } = await Api().get("/logout")
            router.refresh()
            setShowSettings(false)
        }catch{

        }
    }

    return <div className="flex justify-between items-center">

        {showNavigation ? <SideNaviagtionButtonHidden /> : <SideNavigationButton iconName="bermalam" setshow={setShowNavigation} value={true} />}

        {!showNavigation ? <></> : <div className={`w-full max-w-225 h-11 p-2.5 px-5 flex justify-between items-center gap-2.5 rounded-2xl bg-white ${border ? "border-2 border-(--status-refund)" : ""}`}>
            <Link
                href={"/"}
                className="flex h-full justify-center items-center gap-2"
            >
                <Image
                    src="/icons/bermalam.svg"
                    className="rounded-full"
                    height={25}
                    width={25}
                    alt="bermalam -logo"
                />
                <span className="text-sm opacity-80">Bermalam</span>
            </Link>
            <div className="w-full flex justify-center items-center gap-4">
                {
                    navigationLink.map((nav: NavigationLinkProps, index) => {
                        return <Link
                            key={`${nav.name}-${index}`}
                            href={nav.href}
                            className={pathName == "/" + nav.name ? "text-(--status-refund)" : ""}
                        >{nav.label}</Link>
                    })
                }
            </div>
            <button className="flex justify-center items-center"
                onClick={() => setShowNavigation(false)}
            >
                <Image
                    src={"/icons/ic_close_tight.svg"}
                    className="rounded-full"
                    height={25}
                    width={25}
                    alt="ic-close"
                />
            </button>
        </div>
        }
        {/* settings */}
        <div className="w-11 h-11 flex justify-center items-center rounded-full bg-background relative">
            <button className="cursor-pointer"
                onClick={() => setShowSettings(prev => !prev)}
            >
                <Image
                    src={"/icons/ic_setting.svg"}
                    className="rounded-full"
                    height={30}
                    width={30}
                    alt="icon-setting"
                />
            </button>
            { showSettings? <div className="min-w-50 flex flex-col gap-3.5 py-3 px-2.5 bg-white border-3 border-(--status-refund) rounded-lg absolute -bottom-40 right-2 z-20">
                {user && <>
                    <Link className="w-max flex items-center gap-1.5 cursor-pointer"
                        href={"/profile"}
                    >
                        <BookingIcons className="w-6 h-6" name="adult" />
                        <span className="">Profile</span>
                    </Link>
                    <Link className="w-max flex items-center gap-1.5 cursor-pointer"
                        href={"/vouchers"}
                    >
                        <ActionIcon className="w-6 h-6" name="bermalam_coin" />
                        <span className="">Points</span>
                    </Link>
                    <Link
                        href={"/transactions/history"}
                        className="w-max flex items-center gap-1.5 cursor-pointer"
                    >
                        <ActionIcon className="w-6 h-6" name="history" />
                        <span className="">Histori Pemesanan</span>
                    </Link>
                </>}
                {!user && <>
                    <Link className="w-max flex items-center gap-1.5 cursor-pointer"
                        href={"/auth/sign-up"}
                    >
                        <ActionIcon className="w-6 h-6" name="sign-in" />
                        <span className="">Daftar</span>
                    </Link>
                    <Link className="w-max flex items-center gap-1.5 cursor-pointer"
                        href={"/auth/sign-in"}
                    >
                        <ActionIcon className="w-6 h-6" name="sign-in" />
                        <span className="">Masuk</span>
                    </Link>
                </>}
                {user && <button className="w-max flex items-center gap-1.5 cursor-pointer"
                    onClick={HandleLogout}
                >
                    <ActionIcon className="w-6 h-6" name="sign-in" />
                    <span className="">Log Out</span>
                </button>}
            </div> : <></> }
        </div>
    </div >
}

function SideNaviagtionButtonHidden() {
    return <div className="w-11 h-11"></div>
}

function SideNavigationButton(
    {
        value,
        iconName,
        setshow,
    }: {
        value: boolean,
        iconName: string,
        setshow: Dispatch<SetStateAction<boolean>>
    }
) {
    return <button
        className="w-11 h-11 flex justify-center items-center rounded-full bg-background"
        onClick={() => setshow(value)}
    >
        <Image
            src={`/icons/${iconName}.svg`}
            className="rounded-full"
            height={25}
            width={25}
            alt="bermalam -logo"
        />
    </button>
}
