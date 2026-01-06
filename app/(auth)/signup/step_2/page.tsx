"use client"
import CallApi from "@/utils/CallApi";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"


export default function SignupStep2() {
    
    const [isActive, setIsActive] = useState<boolean>(false);
    
    const router = useRouter();
    
    useEffect(checkStatusHandle, [router])
    

    function checkStatusHandle() {
        const api = CallApi();
        api.get("/check-activate-account")
        .then(res => {
            if (res.status == 200){
                setIsActive(res.data.verified)
            }else if(res.status === 403){
                router.push('/signin')
            }
        })
    }

    return isActive ? <ActiveWrapper router={router} /> : <UnactiveWrapper handler={checkStatusHandle} />;
}

function ActiveWrapper({
    router
} : {
    router : AppRouterInstance
}) {
    

   setTimeout(() => {
    router.push('/mitra/dashboard')
   }, 5000);

    return <div className="w-full p-6 flex flex-col items-center gap-3.5">
        <h2 className="text-3xl font-bold text-(--b1)">Selamat Aktivasi Berhasil</h2>
        <div className="w-max h-max flex gap-20.5 justify-center relative" id="progress-bar">
            <div className="bg-(--b1) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                <span className="text-background font-bold">1</span>
            </div>
            <div className="bg-(--b1) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                <span className="text-background font-bold">2</span>
            </div>
            <div className="bg-(--b1) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                <span className="text-background font-bold">3</span>
            </div>
            <div className="w-full h-full flex justify-center items-center absolute -z-10">
                <div className="w-full h-1 bg-(--b1)"></div>
                <div className="w-full h-1 bg-(--b1)"></div>
                <div className="w-full h-1 bg-(--b1)"></div>
            </div>
        </div>
        <h4 className="text-lg text-(--b1) font-bold">Selamat!, Aktivasi Berhasil...</h4>
        <div className="flex h-full flex-col justify-center items-center gap-2.5">
            <Image
                src={"/icons/ic_success_outline.svg"}
                width={120}
                height={120}
                alt="send-message-to-email"
            />
            <h4 className="text-lg text-(--b1) font-bold">Aktivasi Berhasil</h4>
            <p className="text-sm text-(--b1) text-center">Selamat!, Aktivasi Akun Mu Berhasil, <br />Kamu Akan Diarahkan Ke Halaman Kami Dalam Waktu 5 detik...</p>
        </div>
    </div>
}

function UnactiveWrapper({
    handler
}: {
    handler: () => void
}) {
    return <div className="w-full p-6 flex flex-col items-center gap-3.5">
        <h2 className="text-3xl font-bold text-(--b1)">Aktivasi Akun</h2>
        <div className="w-max h-max flex gap-20.5 justify-center relative" id="progress-bar">
            <div className="bg-(--b1) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                <span className="text-background font-bold">1</span>
            </div>
            <div className="bg-(--b1) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                <span className="text-background font-bold">2</span>
            </div>
            <div className="bg-(--b3) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                <span className="text-foreground font-bold">3</span>
            </div>
            <div className="w-full h-full flex justify-center items-center absolute -z-10">
                <div className="w-full h-1 bg-(--b1)"></div>
                <div className="w-full h-1 bg-(--b1)"></div>
                <div className="w-full h-1 bg-(--b3)"></div>
            </div>
        </div>
        <h4 className="text-lg text-(--b1) font-bold">Yukk, Verifikasi Sekarang!</h4>
        <div className="flex h-full flex-col justify-center items-center gap-2.5">
            <Image
                src={"/icons/ic_near_facility.svg"}
                width={120}
                height={120}
                alt="send-message-to-email"
            />
            <h4 className="text-lg text-(--b1) font-bold">Periksa Email Anda!</h4>
            <p className="text-sm text-(--b1) text-center">Kami telah mengirimkan email kepada anda, <br />untuk melakukan pengaktifan akun!</p>
            <div className="flex flex-col gap-2.5">
                <p className="text-sm text-(--b1) text-center">Periksa Status Akunmu Disini!</p>
                <button className="p-2 bg-none border-2 border-(--b1) text-(--b1) hover:text-background hover:bg-(--b1) font-bold rounded-sm cursor-pointer"
                    onClick={handler}
                >Cek Aktivasi Akun</button>
            </div>
        </div>
    </div>
}