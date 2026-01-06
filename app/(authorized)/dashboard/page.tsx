import { GenerateAreaChart } from "@/lib/GenerateChart";
import NavigationIcons from "@/lib/icons/NavigationIcons";
import StatiticIcons from "@/lib/icons/StatisticIcons";

export default function DashboardPage() {
    return (
        <div className="w-full flex flex-col gap-3.5 font-inter">
            <div className="w-full flex justify-between items-center">
                <h2 className="font-bold">Ringkasan Penggunaan Bermalam Dan Bersi</h2>
                <div className="flex items-center gap-2.5">
                    <span>6 Bulan</span>
                    <button className="text-(--status-refund) cursor-pointer">Ganti Periode</button>
                    {/* ketika di hover si text muncul... */}
                    <button className="flex items-center gap-2.5 bg-(--b1) p-1 rounded-lg">
                        <StatiticIcons
                            name="download"
                            className="w-6 h-6 text-background"
                        />
                        <span className="hidden text-sm font-bold text-background">Download Ringkasan Data</span>
                    </button>
                </div>
            </div>
            {/* summary card disini */}
            <div className="flex">
                <div className="w-[60%] flex flex-wrap gap-2.5">
                    {[
                        {
                            icon_name: "view",
                            label: "Total Pengunjung",
                            content: 13000,
                            isRise: false
                        },
                        {
                            icon_name: "hotel",
                            label: "Total Hotel",
                            content: 303,
                            isRise: false
                        },
                        {
                            icon_name: "account",
                            label: "Total Tamu Terdaftar",
                            content: 13000,
                            isRise: false
                        },
                        {
                            icon_name: "account",
                            label: "Total Mitra Terdaftar",
                            content: 101,
                            isRise: false
                        },
                    ].map((s, i) => {
                        return <CardSummary
                            key={`key-${s.icon_name}-${i}`}
                            icon_name={s.icon_name}
                            label={s.label}
                            content={s.content}
                            isRise={true}
                        />
                    })}
                </div>
                <div className="w-full h-full bg-red-400"></div>
            </div>
            {/* chart gede disini wkwk */}
            <div className="w-full min-h-100 flex flex-col bg-white p-3.5 rounded-2xl">
                <div className="flex flex-col gap-2.5">
                    <h2 className="text-xl font-bold text-(--b1)">Pendapatan Aplikasi Selama 6 Bulan Ini</h2>
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-3xl font-bold text-(--status-wait)">Rp. 103.200.000</h2>
                        <div className="flex justify-center items-center gap-2">
                            <h2 className="text-lg font-bold text-(--b1)">103.4%</h2>
                            <div className="p-2 flex justify-center items-center rounded-lg bg-(--b1)">
                                <StatiticIcons
                                    className="w-5 h-5 text-background stroke-3"
                                    name="rise"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full h-100 relative" id="area-chart">
                    <GenerateAreaChart />
                </div>
            </div>
            <div className="w-full flex flex-wrap gap-2.5 overflow-hidden overflow-x-scroll">
                {
                    [
                        {
                            icon_name:"transaction",
                            label:"Pemesanan Kamar",
                            content:13000,
                            isRise:true
                        },
                        {
                            icon_name:"transaction",
                            label:"Pesanan Berhasil",
                            content:12000,
                            isRise:true
                        },
                        {
                            icon_name:"transaction",
                            label:"Pembatalan Pemesanan",
                            content:900,
                            isRise:false
                        },
                        {
                            icon_name:"transaction",
                            label:"Pengembalian Dana",
                            content:60,
                            isRise:false
                        },
                        {
                            icon_name:"transaction",
                            label:"Permintaan Pengembalian",
                            content: 40,
                            isRise:true
                        }
                    ].map((s, i) => {
                        return <CardSummaryV2 
                        key={`key-${s.icon_name}+${i}`}
                        icon_name={s.icon_name}
                        label={s.label}
                        content={s.content}
                        isRise={s.isRise}
                        />
                    })
                }
            </div>
        </div>
    )
}

interface CarSummaryNeeded {
    icon_name: string
    label: string
    content: string | number
    isRise: boolean
}

function CardSummary({
    icon_name,
    label,
    content,
    isRise
}: CarSummaryNeeded) {
    return <div className="w-48 min-h-24 flex flex-col gap-2.5 bg-white rounded-sm p-1.5">
        <div className="w-10 h-10 bg-(--b1) flex justify-center items-center rounded-lg">
            <StatiticIcons
                name={icon_name}
                className="w-6 h-6 text-background"
            />
        </div>
        <div className="flex flex-col gap-1.5">
            <span className="text-sm">{label}</span>
            <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm">{content}</span>
                <div className="flex gap-1">
                    {/* icon disini */}
                    <StatiticIcons
                        name="rise"
                        className={`w-4 h-4 ${isRise ? "text-(--status-done)" : "text-(--status-reject)"}`}
                    />
                    <span className="text-xs text-(--b3)">45%</span>
                </div>
            </div>
        </div>
    </div>
}

function CardSummaryV2({ 
    icon_name,
    label,
    content,
    isRise
} : CarSummaryNeeded) {
    return (
        <div className="w-56 min-h-30 p-5 rounded-sm bg-white flex flex-col gap-2.5 justify-between items-center">
            <div className="flex flex-col justify-center items-center gap-2.5">
                <div className="w-max h-max p-1 flex justify-center items-center bg-(--b1) rounded-sm">
                    <NavigationIcons
                        className="w-6 h-6 text-background"
                        name={icon_name}
                    />
                </div>
                <span className="text-sm">{label}</span>
            </div>
            <h2 className="font-bold text-lg">{content}</h2>
            <div className="flex gap-1">
                <div className="flex gap-1.5">
                    <StatiticIcons
                        name="rise"
                        className={`w-5 h-5 text-(--status-done)`}
                    />
                    <span className={`text-sm ${isRise? "text-(--status-done)" : "text-(--status-reject)"}`}>85.5%</span>
                </div>
                <span className="text-sm text-foreground">Last 6 Months</span>
            </div>
        </div>
    )
}