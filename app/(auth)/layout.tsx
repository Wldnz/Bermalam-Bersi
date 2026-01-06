// import { Metadata } from "next";

import Image from "next/image"

export default function AuthenticationLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div className="w-full flex font-inter">
            <aside className="min-w-[60%] min-h-dvh hidden md:flex flex-col justify-between bg-(--b1) p-5">
                <div className="flex flex-col gap-5.5">
                    <h2 className="text-2xl font-bold text-background">Bermalam Sinergi</h2>
                <Image
                    className="self-center"
                    src={'/images/thumbnail-bersi.png'}
                    width={675}
                    height={400}
                    alt="bermalam-foto"
                />
                <p className="text-sm text-background">Bermalam Sinergi atau dikenal sebagai Bersi adalah aplikasi property management system (PMS) Anda. Fungsinya fokus pada efisiensi operasional dan pengurangan risiko human error, terutama pemesanan ganda.</p>
                </div>
                <p className="text-lg text-background text-center self-center opacity-35">Cobain Sekarang Dan <br />Nikmati Keuntungannya!</p>
            </aside>
            <aside className="w-full p-2.5 flex flex-col">
                <div className="bg-(--b1) w-8 h-8 rounded-full flex justify-center items-center self-end">
                    <Image
                        src={'/icons/ic_id.svg'}
                        width={20}
                        height={20}
                        alt="country-flag"
                    />
                </div>
                {children}
            </aside>
        </div>
    )
}