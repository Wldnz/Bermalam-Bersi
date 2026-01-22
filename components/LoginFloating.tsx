import Image from "next/image";
import ActionIcon from "./Icons/Action";

export default function LoginFloatingAction() {
    <div className="w-full h-dvh p-5 flex justify-center items-center fixed top-0 left-0 z-20">
        <div className="w-[95%] h-max p-5 py-8 flex gap-3 bg-white border-2 border-(--status-refund) rounded-lg">
            <div className="flex flex-col justify-between gap-2.5 p-2">
                <div className="flex flex-col gap-2.5">
                    <Image
                        className="w-full h-70 rounded-lg"
                        src={"/images/ads-1.jpg"}
                        width={200}
                        height={200}
                        alt="images"
                    />
                    <div className="flex flex-col gap-0.5">
                        <h2 className="font-bold text-lg">Temukan Tempat Bermalam Disekitar Wisata</h2>
                        <span className="text">Kamu bisa banget menemukan tempat untuk bermalam disekitar wisata atau tempat yang ingin kamu kunjungi</span>
                    </div>
                    <button className="w-max p-2.5 font-bold text-(--status-refund) border-2 border-(--status-refund) rounded-sm cursor-pointer">Cobain Sekarang!</button>
                </div>
                <div className="flex items-center justify-between">
                    <button className="p-1 bg-(--status-refund) rounded-sm cursor-pointer">
                        <ActionIcon className="w-8 h-8 text-background rotate-180" name="arrow-right-v1" />
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-(--status-refund) rounded-full"></div>
                        <div className="w-5 h-5 bg-(--b3) rounded-full"></div>
                        <div className="w-5 h-5 bg-(--b3) rounded-full"></div>
                        <div className="w-5 h-5 bg-(--b3) rounded-full"></div>
                    </div>
                    <button className="p-1 bg-(--status-refund) rounded-sm cursor-pointer">
                        <ActionIcon className="w-8 h-8 text-background" name="arrow-right-v1" />
                    </button>
                </div>
            </div>
            <div className="w-180 h-max p-5 py-5 full flex flex-col gap-4 items-center bg-white border-2 border-(--status-refund) shadow-xl rounded-lg">
                <h2 className="font-bold text-(--status-refund) text-2xl">Selamat Datang Kembali</h2>
                <div className="w-[80%] p-1 grid grid-cols-2 items-center bg-(--status-refund) rounded-lg">
                    <button className="bg-background text-xl text-(--status-refund) font-bold p-2.5 rounded-sm cursor-pointer">Masuk</button>
                    <button className="text-background text-xl font-bold p-2.5 rounded-sm cursor-pointer">Daftar</button>
                </div>
                <span>Silahkan, Masukkan Dengan Akun Yang Sudah Terdaftar Ya!</span>
                <div className="w-full flex flex-col gap-2.5 px-2">
                    <div className="flex flex-col gap-1">
                        <label className="font-medium" htmlFor="login_email_address">Alamat Email</label>
                        <span className="text-sm">Masukkan alamat email yang sudah terdaftar</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <input
                            className="p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                            id="login_email_address"
                            type="email"
                            minLength={3}
                            placeholder="wildan@example.com"
                            required
                        />
                        <span className="text-(--status-reject) text-sm">Email Kamu Tidak Terdaftar!</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="font-medium" htmlFor="login_email_address">Kata Sandi</label>
                        <span className="text-sm">Masukkan Kata Sandi</span>
                    </div>
                    <div className="w-full flex items-center gap-2 relative">
                        <input
                            className="w-full p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                            id="login_email_address"
                            type="password"
                            minLength={8}
                            placeholder=""
                            required
                        />
                        <button className="cursor-pointer absolute top-2.5 right-2">
                            <ActionIcon className="w-6 h-6 text-(--status-refund)" name="eye" />
                        </button>
                    </div>
                </div>
                <div className="w-full flex items-center gap-2.5 px-2">
                    <button className="w-full text-background bg-(--status-refund) text-xl font-bold p-2.5 rounded-lg cursor-pointer">Masuk</button>
                    <button className="p-2 flex items-center justify-center font-bold bg-(--status-refund) rounded-lg cursor-pointer">
                        <ActionIcon className="w-8 h-8" name="google" />
                    </button>
                </div>
            </div>
        </div>
    </div>
}