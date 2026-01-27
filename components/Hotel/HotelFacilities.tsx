import ActionIcon from "../Icons/Action";

export default function HotelFacilities() {
    return <div className="flex flex-col gap-5 p-2" id="facilities">
        <h2 className="font-bold text-xl">Fasilitas - Fasilitas Yang Dimiliki</h2>
        <div className="flex gap-10">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-background rounded-lg"></div>
                    <h4 className="font-bold">Hiburan Dan Komunikasi</h4>
                </div>
                <div className="flex items-center gap-2">
                    <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                    <span className="">Televesion</span>
                </div>
                <div className="flex items-center gap-2">
                    <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                    <span className="">Televesion</span>
                </div>
                <div className="flex items-center gap-2">
                    <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                    <span className="">Televesion</span>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-background rounded-lg"></div>
                    <h4 className="font-bold">Fasilitas Umum</h4>
                </div>
                <div className="flex items-center gap-2">
                    <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                    <span className="">Televesion</span>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-background rounded-lg"></div>
                    <h4 className="font-bold">Makanan Dan Sarapan</h4>
                </div>
                <div className="flex items-center gap-2">
                    <ActionIcon className="w-5 h-5 text-(--status-done)" name="success" />
                    <span className="">Televesion</span>
                </div>
            </div>
        </div>
    </div>
}