"use client"

import ActionIcon from "@/components/Icons/Action";
import ShowAlert from "@/components/ShowAlert";
import { useBooking } from "@/context/Booking";
import { useUser } from "@/context/UserContext";
import { AxiosErrorCustom } from "@/models/Models";
import { ShowAlertProps } from "@/models/ShowAlertProps";
import Api from "@/utils/Api";
import GetRedirectURLParams from "@/utils/GetRedirectURL";
import LoginOrRegisterWithGoogle from "@/utils/LoginOrRegisterWithGoogle";
import SetShowAlertStateAction from "@/utils/SetShowAlert";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RegisterData {
    first_name: string
    last_name: string
    email: string
    password: string
    confirm_password: string
}

export default function AuthPage() {

    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectURL = GetRedirectURLParams(searchParams)

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setConfirmShowPassword] = useState<boolean>(false)

    const [registerData, setRegisterData] = useState<RegisterData>({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
    })

    const [passwordMessage, setPasswordMessage] = useState<string>("")

    const [errorMessage, setErrorMessage] = useState<string>("")

    const [showAlertProps, setShowAlertProps] = useState<ShowAlertProps | undefined>()

    const { user, saveCredentials, GetCurrentCredentials } = useUser();

    useEffect(() => {
        if (!user) return
        router.push(redirectURL)
    }, [router, user, redirectURL])

    async function HandleSubmit() {

        if (registerData.confirm_password != registerData.password) {
            setPasswordMessage("Kata Sandi Dan Konfirmasi Kata Sandi Berbeda")
            return
        }

        try {
            const { } = await Api().post("/sign-up", registerData)
            SetShowAlertStateAction({
                title: "Berhasil Mendaftarkan Akun!",
                category: "success",
                description: "Akun anda berhasil didaftarkan pada bermalam! & Kamu Akan Diarahkan Ke Halaman Utama",
                actions: [],
                closeAction: {
                    label: "Tutup Pemberitahuan",
                    handler: () => router.push(redirectURL)
                },
                iShowed: true
            }, setShowAlertProps)
            setErrorMessage("")
        } catch (err) {
            const error = err as AxiosErrorCustom
            setErrorMessage(error.response.data.message)
            SetShowAlertStateAction({
                title: error.status === 500 ? "Telah Terjadi Kesalahan" : "Peringatan",
                category: error.status === 500 ? "error" : "information",
                description: error.response.data.message,
                actions: [],
                iShowed: true
            }, setShowAlertProps)
            saveCredentials(null)
        } finally {
            GetCurrentCredentials()
        }
        setPasswordMessage("")
    }

    return <div className="w-full min-h-dvh p-5 py-8 flex gap-3 bg-white rounded-lg">
        <div className="hidden md:flex flex-col justify-between gap-2.5 p-2">
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
                HandleSubmit()
            }}
        >
            <h2 className="font-bold text-(--status-refund) text-2xl">Selamat Datang Kembali</h2>
            <div className="w-[80%] p-1 grid grid-cols-2 items-center text-center text-xl font-bold bg-(--status-refund) rounded-lg">
                <Link href={`/auth/sign-in?redirect_url=${redirectURL}`} className="text-background p-2.5 rounded-sm cursor-pointer">Masuk</Link>
                <div className="bg-background  text-(--status-refund) p-2.5 rounded-sm cursor-pointer">Daftar</div>
            </div>

            <div className="flex flex-col gap-2.5">
                <span>Silahkan, Mengisi Data Yang Dibutuhkan Ya!</span>
                {errorMessage && <span className="text-center text-(--status-reject) text-lg">{errorMessage}</span>}
            </div>

            <div className="w-full flex flex-col gap-5 px-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-full flex flex-col gap-2.5">
                        <div className="flex flex-col gap-0.5">
                            <label className="font-medium" htmlFor="first_name">Nama Depan</label>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <input
                                className="p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                                id="first_name"
                                type="text"
                                minLength={3}
                                placeholder="Wildan"
                                value={registerData.first_name}
                                onChange={(e) => setRegisterData(prev => {
                                    return {
                                        ...prev,
                                        ...{
                                            first_name: e.target.value
                                        }
                                    }
                                })}
                                required
                            />
                        </div>
                    </div>
                    <div className="w-full flex flex-col gap-2.5">
                        <div className="flex flex-col gap-0.5">
                            <label className="font-medium" htmlFor="first_name">Nama Belakang</label>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <input
                                className="p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                                id="last_name"
                                type="text"
                                minLength={3}
                                placeholder="Izhar A."
                                value={registerData.last_name}
                                onChange={(e) => setRegisterData(prev => {
                                    return {
                                        ...prev,
                                        ...{
                                            last_name: e.target.value
                                        }
                                    }
                                })}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-0.5">
                        <label className="font-medium" htmlFor="email">Alamat Email</label>
                    </div>
                    <input
                        className="w-full p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                        id="email"
                        type="email"
                        minLength={8}
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => {
                            return {
                                ...prev,
                                ...{
                                    email: e.target.value
                                }
                            }
                        })}
                        placeholder="wildan@example.com"
                        required
                    />
                </div>
                <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-0.5">
                        <label className="font-medium" htmlFor="password">Kata Sandi</label>
                    </div>
                    <div className="w-full flex items-center gap-2 relative">
                        <input
                            className="w-full p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                            id="password"
                            type={showPassword ? "text" : "password"}
                            minLength={8}
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => {
                                return {
                                    ...prev,
                                    ...{
                                        password: e.target.value
                                    }
                                }
                            })}
                            placeholder=""
                            required
                        />
                        <button className="cursor-pointer absolute top-3 right-3"
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                        >
                            <ActionIcon className="w-6 h-6 text-(--status-refund)" name={showPassword ? "eye_close" : "eye"} />
                        </button>
                    </div>
                    {passwordMessage && <span className="text-(--status-reject)">Kata Sandi Harus Sama Dengan Konfirmasi Kata Sandi</span>}
                </div>
                <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-0.5">
                        <label className="font-medium" htmlFor="confirm_password">Konfirmasi Kata Sandi</label>
                    </div>
                    <div className="w-full flex items-center gap-2 relative">
                        <input
                            className="w-full p-2.5 bg-background border-2 border-(--status-refund) outline-none rounded-lg"
                            id="confirm_password"
                            type={showConfirmPassword ? "text" : "password"}
                            minLength={8}
                            value={registerData.confirm_password}
                            onChange={(e) => setRegisterData(prev => {
                                return {
                                    ...prev,
                                    ...{
                                        confirm_password: e.target.value
                                    }
                                }
                            })}
                            placeholder=""
                            required
                        />
                        <button className="cursor-pointer absolute top-3 right-3"
                            type="button"
                            onClick={() => setConfirmShowPassword(prev => !prev)}
                        >
                            <ActionIcon className="w-6 h-6 text-(--status-refund)" name={showConfirmPassword ? "eye_close" : "eye"} />
                        </button>
                        {passwordMessage && <span className="text-(--status-reject)">Konfirmasi Kata Sandi Harus Sama Dengan Kata Sandi</span>}
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-between items-center px-2">
                <Link
                    className="text-(--status-refund)"
                    href={"/auth/sign-in"}
                >Sudah Memiliki Akun?</Link>
            </div>
            <div className="w-full flex items-center gap-2.5 px-2">
                <button className="w-full text-background bg-(--status-refund) text-xl font-bold p-2.5 rounded-lg cursor-pointer">Daftar</button>
                <button className="p-2 flex items-center justify-center font-bold bg-(--status-refund) rounded-lg cursor-pointer"
                    type="button"
                    onClick={() => LoginOrRegisterWithGoogle(router, setErrorMessage)}
                >
                    <ActionIcon className="w-8 h-8" name="google" />
                </button>
            </div>
        </form>
        {showAlertProps && showAlertProps?.iShowed && <ShowAlert showedAlertProps={showAlertProps} setShowedAlertProps={setShowAlertProps} />}
    </div>
}