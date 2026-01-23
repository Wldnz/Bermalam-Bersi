"use client"
import ActionIcon from "@/components/Icons/Action";
import BookingIcons from "@/components/Icons/Booking";
import Navigation from "@/components/Navigation";
import { useBooking } from "@/context/Booking";
import Api from "@/utils/Api";
import convertNumberIntoIDR from "@/utils/ConvertNumberToIDR";
import GetLabelDate from "@/utils/GetLabelDate";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HistoryTransactionProps {
    id: number,
    status: string,
    category: string,
    total_price: string,
    hotel: {
        name: string,
        image_url: string,
        address_1: string,
        latitude: string,
        longitude: string,
        rooms: {
            name: string,
            total_rooms: string
        }[]
    },
    check_in_at: string,
    check_out_at: string,
    created_at: string
}

export default function HistoryTransaction() {

    const router = useRouter()

    const { user } = useBooking()

    const [histories, setHistories] = useState<HistoryTransactionProps[] | []>([])

    useEffect(() => {
        const fetchHistories = async () => {
            try {
                const { data } = await Api().get("/transactions")
                setHistories(data.data)
            } catch {
                setHistories([])
            }
        }
        fetchHistories()
    }, [])

    // if (!user) {
    //     router.push("/auth/sign-in")
    // }

    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />
        <div className="w-full flex items-center justify-between p-5">
            <div className="flex flex-col gap-2.5">
                <span className="text-lg font-medium">Perlihat Status Berdasarkan Warna:</span>
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 bg-(--status-refund) rounded-full"></div>
                    <div className="w-6 h-6 bg-(--status-reject) rounded-full"></div>
                    <div className="w-6 h-6 bg-(--status-wait) rounded-full"></div>
                    <div className="w-6 h-6 bg-(--status-done) rounded-full"></div>
                    <div className="w-6 h-6 bg-(--status-check-in) rounded-full"></div>
                    <div className="w-6 h-6 bg-(--status-check-out) rounded-full"></div>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-max p-2 flex justify-center items-center bg-(--status-refund) rounded-lg">
                    <ActionIcon className="w-7 h-7 text-background" name="filter_1" />
                </div>
                <div className="relative">
                    <input
                        className="w-100 min-h-12 p-2 border-2 border-(--status-refund) outline-none rounded-2xl"
                        type="text"
                        placeholder="Cari Nama Hotel Disini..."
                    />
                    <div className="w-max flex items-center justify-center bg-(--status-refund) rounded-lg absolute top-2 right-5">
                        <ActionIcon className="w-8 h-8 text-background" name="search" />
                    </div>
                </div>
            </div>
        </div>
        {histories.map((history, index) => {
            return <div className="w-full flex flex-col gap-5 p-5" key={`index-history-${index + 1}`}>
                <div className="flex gap-4">
                    <Image
                        className="w-100 rounded-lg"
                        src={"/images/dashboard.png"}
                        width={200}
                        height={200}
                        alt="image"
                    />
                    <div className="w-full flex flex-col gap-2.5">
                        <h2 className="text-xl font-medium">{history.hotel.name}</h2>
                        <div className="flex flex-col gap-2">
                            {history.hotel.rooms.map((room, idx) => {
                                return <div className="flex gap-4" key={`hotel-rooms-${idx}-${room.name}`}>
                                    <span className="bg-(--status-refund) text-background font-medium p-2 px-3 rounded-lg text-sm">{room.name}</span>
                                    <span className="bg-(--status-refund) text-background font-medium p-2 px-3 rounded-lg text-sm">{room.total_rooms}x Kamar</span>
                                </div>
                            })}
                            <div className="flex flex-col gap-2">
                                <span className="">Tanggal Transaksi Dibuat</span>
                                <div className="flex items-center gap-2">
                                    <BookingIcons className="w-6 h-6 text-(--status-refund)" name="check_in" />
                                    <span>{GetLabelDate(new Date(history.created_at))}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 flex items-center gap-2.5 border-2 border-(--status-refund) rounded-lg">
                                    <ActionIcon className="w-6 h-6 text-(--status-refund)" name="close_outline" />
                                    <span className="">{GetLabelDate(new Date(history.check_in_at))}</span>
                                </div>
                                <div className="p-2 flex items-center gap-2.5 border-2 border-(--status-refund) rounded-lg">
                                    <ActionIcon className="w-6 h-6 text-(--status-refund)" name="close_outline" />
                                    <span className="">{GetLabelDate(new Date(history.check_out_at))}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                            <div className="w-max flex items-center gap-1 border-(--status-refund) border-2 p-1 px-3 rounded-lg">
                                <ActionIcon className="w-5 h-5 text-(--status-refund)" name="close_outline" />
                                <span className="text-(--status-refund)">{history.status}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-(--status-wait) text-xl font-bold">{convertNumberIntoIDR(history.total_price)}</span>
                                <button className="p-3.5 font-bold text-background bg-(--status-refund) rounded-sm cursor-pointer">Lihat Pemesanan</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        })}
    </div>
}