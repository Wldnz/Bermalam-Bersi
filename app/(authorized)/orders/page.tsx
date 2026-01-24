import ActionIcons from "@/lib/icons/ActionIcons";

export default function orders(){
    return <div className="w-full flex flex-col gap-2.5 font-inter">
        <div className="w-full flex justify-between items-center">
            <h2 className="font-bold text-xl text-(--b1)">Manajemen Pemesanan Kamar</h2>
            <div className="flex items-center justify-center p-2 text-background bg-(--b1) rounded-lg cursor-pointer">
                <ActionIcons className="w-6 h-6" name="download" />
            </div>
        </div>

        <div className="flex items-center gap-10 border-b-2 border-(--b3) p-2">
            <button className="font-bold text-sm">Semuanya</button>
            <div className="flex items-center gap-2">
                <button className="font-medium text-sm">Menunggu Tamu</button>
                <div className="w-5 h-5 flex justify-center items-center text-sm bg-(--b3) rounded-full">
                    <span>9</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="font-medium text-sm">Check - In</button>
                <div className="w-5 h-5 flex justify-center items-center text-sm bg-(--b3) rounded-full">
                    <span>2</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="font-medium text-sm">Check - Out</button>
                <div className="w-5 h-5 flex justify-center items-center text-sm bg-(--b3) rounded-full">
                    <span>1</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button className="font-medium text-sm">Berhasil</button>
                {/* <div className="w-5 h-5 flex justify-center items-center text-sm bg-(--b3) rounded-full">
                    <span>1</span>
                </div> */}
            </div>
        </div>

        <div className="w-full flex flex-col gap-2.5">
            <div className="w-full flex justify-end items-center gap-2.5">
                <button className="w-max h-max flex justify-center items-center p-2 text-background bg-(--b1) rounded-lg cursor-pointer">
                    <ActionIcons className="w-7 h-7" name="scan" />
                </button>
                <button className="flex items-center gap-2.5 p-2 text-background bg-(--b1) rounded-lg font-medium cursor-pointer">
                    <ActionIcons className="w-7 h-7" name="adding_outline" />
                    <span>Tambahkan Pemesanan</span>
                </button>
            </div>

            <div className="w-full flex justify-end items-center gap-2.5">
                <button className="w-max h-max flex justify-center items-center p-2 text-background bg-(--b1) rounded-lg cursor-pointer">
                    <ActionIcons className="w-6 h-6" name="filter_1" />
                </button>
                <div className="flex items-center gap-1.5 rounded-lg border-2 border-(--b1) px-1">
                    <ActionIcons className="w-6 h-6 text-(--b1)" name="search" />
                    <input 
                        className="p-1.5 outline-none"
                        type="text"
                    />
                </div>
            </div>

            {/* table pemesanan */}
            
            <div className="flex flex-col gap-2.5">
                <h2 className="font-bold text-xl text-(--b1)">Terdapat 30 Pemesanan Kamar</h2>
            </div>

        </div>

    </div>
}