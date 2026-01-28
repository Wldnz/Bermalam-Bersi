"use client"
import ActionIcon from "@/components/Icons/Action";
import TransactionIcons from "@/components/Icons/Transactions";
import Navigation from "@/components/Navigation";
import Api from "@/utils/Api";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface VoucherProps {
    id: number,
    name: string
    description: string,
    poin_exchange: number,
    category: string
}

export default function VoucherPage() {

    const [ vouchers, setVouchers ]  = useState<VoucherProps[] | []>([]);

    useEffect(() => {
        getVouchers(setVouchers)
    }, [])

    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />
        <div className="w-full min-h-dvh flex flex-col items-center p-5 gap-20 mt-10">
            <div className="w-full flex flex-col items-center gap-2.5">
                <h2 className="text-lg font-bold">Selamat Datang, John Doe!</h2>
                <span className="text-2xl">🎉 Gembiralah Kamu, Karena Memiliki 1920 Poins 🎉</span>
            </div>
            <div className="w-full flex justify-center items-center gap-4 overflow-x-scroll">
                {/* card kupn */}
                { vouchers.map((voucher, index) => {
                    return <VoucherCard voucher={voucher} key={`voucher-name-${voucher.name}-voucher-${index}`} />
                })}
            </div>
        </div>
    </div>
}

const VoucherCard = ({
    voucher
} : {
    voucher : VoucherProps
}) => {
    return <div className="min-w-80 w-max h-max flex flex-col relative">
        <div className="w-full max-w-80 min-h-60 p-5 flex flex-col justify-between items-center gap-2.5">
            <div className="flex flex-col gap-2.5 text-center">
                <h2 className="text-lg font-bold">{ voucher.name }</h2>
                <span className="text-sm">{ voucher.description }</span>
                <div className="flex justify-center items-center gap-0.5 text-(--status-wait)">
                    <ActionIcon className="w-8 h-8" name="bermalam_coin" />
                    <span className="font-bold">{ voucher.poin_exchange }</span>
                </div>
            </div>
            <div className="w-full h-10 relative">
                <div className="w-10 h-10 bg-white rounded-full absolute top-0 -left-10"></div>
                <div className="w-10 h-10 bg-white rounded-full absolute top-0 -right-10"></div>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
                <button className="w-full flex justify-center items-center gap-2.5 p-2 bg-(--status-refund) text-background rounded-lg cursor-pointer">
                    <TransactionIcons className="w-5 h-5" name="voucher" />
                    <span className="font-bold">Tukarkan Poin</span>
                </button>
                <span className="text-sm">Syarat & Ketentuan Berlaku</span>
            </div>
        </div>
        <div className="w-full min-h-full bg-(--status-refund) opacity-20 rounded-xl absolute top-0 left-0 -z-10"></div>
    </div>
}

const getVouchers = async(
    setVouchers : Dispatch<SetStateAction<VoucherProps[] | []>>
) => {
    try{
        const { data } = await Api().get("vouchers")
        setVouchers(data.data)
    }catch{
        setVouchers([])
    }
}