import Image from "next/image";

export default function NavigationTop() {
    return (
        <div className="w-full flex justify-between items-center h-14 p-2.5">
            <div className="w-full flex items-center gap-2.5">
                <Image
                    width={20}
                    height={20}
                    src={"/icons/ic_search.svg"}
                    alt="icon-search"
                />
                <input
                    className="w-full p-1 outline-none text-sm font-inter"
                    type="text"
                    placeholder="Cari Sesuatu disini...."
                    name="search-something" id="search-something"
                />
            </div>
            <div className="w-9 h-9 flex justify-center items-center bg-white rounded-lg p-.5 relative">
                <Image
                    src={"/icons/ic_notification.svg"}
                    width={30}
                    height={30}
                    alt="notification-alert"
                />
                {/* buat ada berapa notif */}
                <span className="w-5 h-5 p-1 rounded-lg bg-(--status-refund)
                            flex justify-center items-center
                            absolute bottom-0 right-0 text-xs text-background
                                scale-[.8]
                            "
                >2</span>
            </div>
        </div>
    )
}