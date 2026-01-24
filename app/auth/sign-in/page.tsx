"use client"
import ActionIcon from "@/components/Icons/Action";
import { useBooking } from "@/context/Booking";
import { AxiosErrorCustom } from "@/models/Models";
import Api from "@/utils/Api";
import LoginOrRegisterWithGoogle from "@/utils/LoginOrRegisterWithGoogle";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginData {
    email: string
    password: string
    is_remember: boolean
}



export default function AuthPage() {

    const router = useRouter()

    const [showPassword, setShowPassword] = useState<boolean>(false)

    const [ credential, setCredential ] = useState<LoginData>( {
        email : "",
        password : "",
        is_remember: false
    })
    
    const [ errorMessage, setErrorMessage ] = useState<string>("")
    const [ successMessage, setSuccessMessage ] = useState<string>("")

    const { user, saveUser } = useBooking()

    if (user) {
        router.push("/")
    }

    const fetchingData = async() => {
        try{
            const { data, status } = await Api().post("/sign-in", credential)

            if (status === 200) {
                setErrorMessage("")
                setSuccessMessage("Login Anda Berhasil! \nAnda akan diarahkan ke ke halaman utama dalam 5 detik")
                saveUser(data.data)
                setTimeout(() => {
                    router.push("/")
                }, 5000)
            }

        }catch(err){
            const error = err as AxiosErrorCustom
            if(error.status === 404){
                setErrorMessage(error.response?.data.message.includes("or")? "Email Atau Kata Sandi Salah!" : error.response?.data.message)
            }
        }
    }


    return <div className="w-full min-h-dvh p-5 py-8 flex gap-3 bg-white rounded-lg">
        <div className="flex flex-col justify-between gap-2.5 p-2">
            <div className="flex flex-col gap-2.5">
                <Image
                    className="w-full h-80 rounded-lg"
                    src={"/images/ads-1.jpg"}
                    width={200}
                    height={200}
                    alt="images"
                />
                <div className="flex flex-col gap-0.5">
                    <h2 className="font-bold text-lg">Temukan Tempat Bermalam Disekitar Wisata</h2>
                    <span className="text">Kamu bisa banget menemukan tempat untuk bermalam disekitar wisata atau tempat yang ingin kamu kunjungi</span>
                </div>
                <button className="w-max p-2.5 font-bold text-(--status-refund) border-2 border-(--status-refund) rounded-sm cursor-pointer"
                    onClick={() => router.push("/")}
                >Cobain Sekarang!</button>
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
        <form className="w-180 h-max p-5 py-5 full flex flex-col gap-4 items-center bg-white border-2 border-(--status-refund) shadow-xl rounded-lg"
            onSubmit={(e) => {
                e.preventDefault()
                fetchingData()
            }}
        >
            <h2 className="font-bold text-(--status-refund) text-2xl">Selamat Datang Kembali</h2>
            <div className="w-[80%] p-1 grid grid-cols-2 items-center text-center text-xl font-bold bg-(--status-refund) rounded-lg">
                <div className="bg-background  text-(--status-refund) p-2.5 rounded-sm cursor-pointer">Masuk</div>
                <Link href={"/auth/sign-up"} className="text-background p-2.5 rounded-sm cursor-pointer">Daftar</Link>
            </div>
            <div className="flex flex-col gap-1">
                <span>Silahkan, Masukkan Dengan Akun Yang Sudah Terdaftar Ya!</span>
                { errorMessage && <span className="text-center text-(--status-reject)">{errorMessage}</span> }
                { successMessage && <span className="text-center text-(--status-done)">{successMessage}</span> }
            </div>
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
                        value={credential?.email}
                        onChange={(e) => setCredential(prev => { return {...prev, ... { email : e.target.value  } } })}
                        placeholder="wildan@example.com"
                        required
                    />
                    {/* <span className="text-(--status-reject) text-sm">Email Kamu Tidak Terdaftar!</span> */}
                </div>
                <div className="flex flex-col gap-1">
                    <label className="font-medium" htmlFor="login_email_address">Kata Sandi</label>
                    <span className="text-sm">Masukkan Kata Sandi</span>
                </div>
                <div className="w-full flex items-center gap-2 relative">
                    <input
                        className="w-full p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                        id="login_email_address"
                        type={showPassword ? "text" : "password"}
                        minLength={8}
                        value={credential.password}
                        onChange={(e) => setCredential(prev => { return {...prev, ... { password : e.target.value } }} )}
                        placeholder=""
                        required
                    />
                    <button className="cursor-pointer absolute top-3 right-3"
                        onClick={() => setShowPassword(prev => !prev)}
                        type="button"
                    >
                        <ActionIcon className="w-6 h-6 text-(--status-refund)" name={showPassword ? "eye_close" : "eye"} />
                    </button>
                </div>
            </div>
            <div className="w-full flex justify-between items-center px-2">
                <div className="flex items-center gap-1">
                    <input
                        className="w-4.5 h-4.5 border-2 border-(--status-refund) rounded-lg cursor-pointer"
                        type="checkbox" id="remember_me"
                        value={credential.is_remember? 1 : 0}
                        onChange={() => setCredential(prev => { return { ...prev, ...{ is_remember : !prev.is_remember  } } } )}
                        />
                    <label className="cursor-pointer" htmlFor="remember_me">Ingat Saya Selama 7 Hari?</label>
                </div>
                <Link
                    className="text-(--status-refund)"
                    href={""}
                >Lupa Password?</Link>
            </div>
            <div className="w-full flex items-center gap-2.5 px-2">
                <button className="w-full text-background bg-(--status-refund) text-xl font-bold p-2.5 rounded-lg cursor-pointer"
                >Masuk</button>
                <button className="p-2 flex items-center justify-center font-bold bg-(--status-refund) rounded-lg cursor-pointer"
                    type="button"
                    onClick={() => LoginOrRegisterWithGoogle(router, setErrorMessage)}    
                >
                    <ActionIcon className="w-8 h-8" name="google" />
                </button>
            </div>
        </form>
    </div>
}