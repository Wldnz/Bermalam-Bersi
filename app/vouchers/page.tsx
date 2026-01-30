"use client"
import ActionIcon from "@/components/Icons/Action";
import TransactionIcons from "@/components/Icons/Transactions";
import Navigation from "@/components/Navigation";
import ShowAlert from "@/components/ShowAlert";
import { useUser } from "@/context/UserContext";
import { AxiosErrorCustom } from "@/models/Models";
import { ShowAlertProps } from "@/models/ShowAlertProps";
import Api from "@/utils/Api";
import SetShowAlertStateAction from "@/utils/SetShowAlert";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface VoucherProps {
    id: number,
    name: string
    description: string,
    poin_exchange: number,
    category: string
}

export default function VoucherPage() {

    const [vouchers, setVouchers] = useState<VoucherProps[] | []>([]);

    const [userVouchers, setUserVouchers] = useState<VoucherProps[] | []>([]);

    const [showAlertProps, setShowAlertProps] = useState<ShowAlertProps | undefined>()

    const { user } = useUser()
    
    const reloadVouchers = () => {
        getVouchers(setVouchers)
        getUserVouchers(setUserVouchers)
    }
    useEffect(() => reloadVouchers, [user])


    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />

        {showAlertProps && showAlertProps.iShowed && <ShowAlert
            showedAlertProps={showAlertProps}
            setShowedAlertProps={setShowAlertProps}
        />}

        <div className="w-full min-h-dvh flex flex-col items-center p-5 gap-20 mt-10">
            <div className="w-full flex flex-col items-center gap-2.5">
                <h2 className="text-lg font-bold">Selamat Datang, John Doe!</h2>
                {user && user.points >= 1 ? <span className="text-2xl">🎉 Gembiralah Kamu, Karena Memiliki {user.points} Poins 🎉</span> : <span className="text-2xl"> Yukk Memesan Tempat Bermalam Untuk Mendapatkan Poin 🤭 </span>}
                <span>Tip: Selesaikan Pemesanan Dan Dapatkan Poin!</span>
            </div>
            {vouchers && vouchers.length ? <div className="w-full flex justify-center items-center gap-4 overflow-x-scroll">
                {/* card kupn */}
                {vouchers.map((voucher, index) => {
                    return <VoucherCard voucher={voucher} setShowAlert={setShowAlertProps} key={`voucher-name-${voucher.name}-voucher-${index}`} handler={reloadVouchers} />
                })}
            </div> : <div className="w-full flex justify-center items-center">
                <span className="">Sorry.. we cannot found any available voucher!</span>
            </div>}

            <div className="w-full flex flex-col gap-10 cursor-pointer">
                    <button className="font-bold text-(--status-done) self-center">Lihat Kupon Yang Kamu Miliki</button>
                    <span className="font-bold text-xl">Kamu Memiliki {userVouchers.length} Kupon Yang Aktif Nih!</span>
                {userVouchers && userVouchers.length ? <div className="w-full flex items-center gap-10 overflow-x-scroll">
                    {/* card kupn */}
                    {userVouchers.map((voucher, index) => {
                        return <UserVoucherCard voucher={voucher} key={`voucher-name-${voucher.name}-voucher-${index}`} />
                    })}
                </div> : <div className="w-full flex justify-center items-center">
                    <span className="">Kamu Tidak Miliki Kupon Yang Aktif!</span>
                </div>}
            </div>

        </div>
    </div>
}

const VoucherCard = ({
    voucher,
    setShowAlert,
    handler
}: {
    voucher: VoucherProps,
    setShowAlert: Dispatch<SetStateAction<ShowAlertProps | undefined>>,
    handler? : () => void
}) => {
    return <div className="min-w-80 w-max h-max flex flex-col relative">
        <div className="w-full max-w-80 min-h-80 p-5 flex flex-col justify-between items-center gap-2.5">
            <div className="flex flex-col gap-2.5 text-center">
                <h2 className="text-lg font-bold">{voucher.name}</h2>
                <span className="text-sm">{voucher.description}</span>
                <div className="flex justify-center items-center gap-0.5 text-(--status-wait)">
                    {voucher.poin_exchange > 0 && <ActionIcon className="w-8 h-8" name="bermalam_coin" />}
                    <span className="font-bold">{voucher.poin_exchange > 0 ? voucher.poin_exchange : "Ambil Secara Gratis"}</span>
                </div>
            </div>
            <div className="w-full h-10 relative">
                <div className="w-10 h-10 bg-white rounded-full absolute top-0 -left-10"></div>
                <div className="w-10 h-10 bg-white rounded-full absolute top-0 -right-10"></div>
            </div>
            <div className="w-full flex flex-col items-center gap-2">
                <button className="w-full flex justify-center items-center gap-2.5 p-2 bg-(--status-refund) text-background rounded-lg cursor-pointer"
                    onClick={() => redeemVoucher(voucher.id, setShowAlert, handler)}
                >
                    <TransactionIcons className="w-5 h-5" name="voucher" />
                    <span className="font-bold">Tukarkan Poin</span>
                </button>
                <span className="text-sm">Syarat & Ketentuan Berlaku</span>
            </div>
        </div>
        <div className="w-full min-h-full bg-(--status-refund) opacity-20 rounded-xl absolute top-0 left-0 -z-10"></div>
    </div>
}

function UserVoucherCard({ voucher }: { voucher: VoucherProps }) {
    return <div className="flex items-center gap-2.5 p-2 border-2 border-(--status-refund) rounded-xl">
        <TransactionIcons className="w-10 h-10 text-(--status-refund)" name="voucher" />
        <div className="flex flex-col gap-1">
            <span className="max-w-60 text-sm">{voucher.name}</span>
            <span className="flex items-center gap-1 text-xs">
                Syarat & Ketentuan Berlaku
                <ActionIcon className="w-4 h-4 text-(--status-refund)" name="information_solid" />
            </span>
        </div>
        {/* <button className="h-10 p-1 px-4 font-bold text-background bg-(--status-refund) text-sm rounded-lg cursor-pointer">Ambil</button> */}
    </div>
}
const getVouchers = async (
    setVouchers: Dispatch<SetStateAction<VoucherProps[] | []>>
) => {
    try {
        const { data } = await Api().get("/vouchers")
        setVouchers(data.data)
    } catch {
        setVouchers([])
    }
}

const getUserVouchers = async (
    setVouchers: Dispatch<SetStateAction<VoucherProps[] | []>>
) => {
    try {
        const { data } = await Api().get("/vouchers/users")
        setVouchers(data.data)
    } catch {
        setVouchers([])
    }
}

const redeemVoucher = async (id: string | number, setShowAlert: Dispatch<SetStateAction<ShowAlertProps | undefined>>, handler? : () => void) => {
    try {
        const { data } = await Api().post(`/vouchers/reedem/${id}`)
        SetShowAlertStateAction({
            title: "Berhasil Melakukan Redeem Kupon",
            category: "success",
            description: data.message,
            iShowed: true,
        }, setShowAlert)
        if(handler) handler()
    } catch(error) {
        const err = error as AxiosErrorCustom
        SetShowAlertStateAction({
            title: err.status == 500? "Telah Terjadi Kesalahan" : "Informasi",
            category: err.status == 500? "error" : "information",
            description: err.response.data.message,
            iShowed: true,
        }, setShowAlert)
    }
}