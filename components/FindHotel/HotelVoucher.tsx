import { useEffect, useState } from "react"
import ActionIcon from "../Icons/Action"
import TransactionIcons from "../Icons/Transactions"
import Api from "@/utils/Api"

export default function FindHotelVoucher() {
    
    const [ vouchers, setVouchers ] = useState<Voucher[] | []>([])
    
    useEffect(() => {
        const fetchVouchers = async() => {
           try{
             const { status, data } = await Api().get('/vouchers')
             if (status == 200) setVouchers(data.data) 
           }catch{
            setVouchers([])
           }
        }
        fetchVouchers()
    }, [])

    return <div className="flex items-center gap-5 px-6">
        {vouchers.map((voucher, index) => {
            return <VoucherCard voucher={voucher} key={`key-${voucher.name}-${index}`} />
        } )}
    </div>
}

interface Voucher{
    id:number
    name:string
    description:string
    poin_exchange:number,
    category:string
}

function VoucherCard({ voucher } : { voucher : Voucher }) {
    return <div className="flex items-center gap-2.5 p-2 border-2 border-(--status-refund) rounded-xl">
        <TransactionIcons className="w-10 h-10 text-(--status-refund)" name="voucher" />
        <div className="flex flex-col gap-1">
            <span className="max-w-60 text-sm">{voucher.name}</span>
            <span className="flex items-center gap-1 text-xs">
                Syarat & Ketentuan Berlaku
                <ActionIcon className="w-4 h-4 text-(--status-refund)" name="information_solid" />
            </span>
        </div>
        <button className="h-10 p-1 px-4 font-bold text-background bg-(--status-refund) text-sm rounded-lg cursor-pointer">Ambil</button>
    </div>
}