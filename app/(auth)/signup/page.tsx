"use client"

import Image from "next/image";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

interface RegisterFormData {
    first_name: string
    last_name: string
    email: string
    phone_country_code: number
    phone: string
    password: string
    confirm_password: string
}

interface ShowErrorMessage {
    email_exist: boolean,
    password_no_match: boolean,
    general_information: ErrorMessage,
}

interface ErrorMessage{
    show:boolean,
    message: string,
}

export default function SignUpPage() {

    const router= useRouter()

    const [registerData, setRegisterData] = useState<RegisterFormData>({
        first_name: "",
        last_name: "",
        email: "",
        phone_country_code: 62,
        phone: "",
        password: "",
        confirm_password: "",
    });

    const [isShowPassword, setIshowPassword] = useState<boolean>(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] = useState<boolean>(false);
    const [isShowErrorMessage, setIsShowErrorMessage] = useState<ShowErrorMessage>({
        email_exist: false,
        password_no_match: false,
        general_information: {
            show :false,
            message:""
        },
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setRegisterData((prev) => ({
            ...prev,
            [name]: value
        }))
        if (isShowErrorMessage.password_no_match && name == "confirm_password" || name == "password") {
            setIsShowErrorMessage((prev) => ({
                ...prev,
                password_no_match: false
            }))
        }
    }

    function handleShowPassword(name = "password") {
        if (name == "confirm_password") {
            setIsShowConfirmPassword((prev) => !prev)
        } else if (name == "password") {
            setIshowPassword((prev) => !prev)
        }
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (registerData.confirm_password != registerData.password) {
            setIsShowErrorMessage((prev) => ({
                ...prev,
                password_no_match: registerData.confirm_password != registerData.password
            }))
            return
        }

        fetch('http://localhost:8000/sign-up-mitra', {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            method: "POST",
            body: JSON.stringify(registerData)
        })
            .then(res => res.json())
            .then(res => {
                if (res.status_code == 201) {
                    router.push('/signup/step_2')
                } else if (res.status_code == 409) {
                    setIsShowErrorMessage((prev) => ({
                        ...prev,
                        email_exist: true
                    }))
                } else {
                    setIsShowErrorMessage((prev) => ({
                        ...prev,
                        general_information: {
                            show : true,
                            message : res.message
                        }
                    }))
                }
            })
            .catch(err => {
                console.log("error ada disini", err)
            })
            .finally(() => {
                // remove loading button, or something....
            })



    }

    return (
        <>
            <div className="w-full p-6 flex flex-col items-center gap-3.5">
                <h2 className="text-3xl font-bold text-(--b1)">DAFTAR</h2>
                <div className="w-max h-max flex gap-20.5 justify-center relative" id="progress-bar">
                    <div className="bg-(--b1) w-8 h-8 rounded-full flex justify-center items-center">
                        <span className="text-background font-bold">1</span>
                    </div>
                    <div className="bg-(--b3) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                        <span className="text-foreground font-bold">2</span>
                    </div>
                    <div className="bg-(--b3) text-foreground w-8 h-8 rounded-full flex justify-center items-center">
                        <span className="text-foreground font-bold">3</span>
                    </div>
                    <div className="w-full h-full flex justify-center items-center absolute -z-10">
                        <div className="w-full h-1 bg-(--b1)"></div>
                        <div className="w-full h-1 bg-(--b3)"></div>
                        <div className="w-full h-1 bg-(--b3)"></div>
                    </div>
                </div>
                <h4 className="text-lg text-(--b1) font-bold">Buat Akun Untuk Menggunakan Bersi</h4>
                {isShowErrorMessage.general_information.show? 
                    <p className="text-sm text-(--status-reject)">{isShowErrorMessage.general_information.message}</p>
                : <></>}
                <form
                    action="#"
                    className="w-full flex flex-col gap-2.5"
                    onSubmit={handleSubmit}
                >
                    <div className="flex flex-col gap-2.5">
                        <div className="w-full h-max flex flex-wrap md:flex-nowrap gap-1.5">
                            <div className="w-full flex flex-col gap-1.5">
                                <label
                                    htmlFor="first_name"
                                    className="text-sm font-bold text-(--b1)"
                                >Nama Awal</label>
                                <input
                                    type="text" id="first_name" name="first_name"
                                    className="border-(--b1) border-2 outline-0 p-2.5 rounded-sm text-sm"
                                    placeholder="John"
                                    minLength={3}
                                    onChange={handleChange}
                                    value={registerData.first_name}
                                    required
                                />
                            </div>
                            <div className="w-full flex flex-col gap-1.5">
                                <label
                                    htmlFor="last_name"
                                    className="text-sm font-bold text-(--b1)"
                                >Nama Akhir</label>
                                <input
                                    type="text" id="last_name" name="last_name"
                                    className="border-(--b1) border-2 outline-0 p-2.5 rounded-sm text-sm"
                                    placeholder="Doe"
                                    onChange={handleChange}
                                    value={registerData.last_name}
                                    minLength={3}
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-1.5">
                            <label
                                htmlFor="email"
                                className="text-sm font-bold text-(--b1)"
                            >Alamat Email</label>
                            <input
                                type="email" id="email" name="email"
                                className="border-(--b1) border-2 outline-0 p-2.5 rounded-sm text-sm"
                                inputMode="email"
                                placeholder="johndoe@example.com"
                                minLength={8}
                                onChange={handleChange}
                                value={registerData.email}
                                required
                            />
                            {/* buat error message */}
                            {isShowErrorMessage.email_exist ? <p className="text-sm text-(--status-reject)">Email Sudah Terdaftar!</p> : <></>}
                        </div>
                        <div className="w-full flex flex-col gap-1.5">
                            <label
                                htmlFor="phone"
                                className="text-sm font-bold text-(--b1)"
                            >Nomor Telepon</label>
                            <div className="flex gap-1.5">
                                <select
                                    name="phone_country_code" id="phone_country_code"
                                    className="p-x-4 border-2 border-(--b1) rounded-sm outline-none flex text-sm"
                                >
                                    <option value="62">+62</option>
                                </select>
                                <input
                                    type="text" id="phone" name="phone"
                                    className="w-full border-(--b1) border-2 outline-0 p-2.5 rounded-sm text-sm"
                                    inputMode="tel"
                                    placeholder="0812812121"
                                    onChange={handleChange}
                                    value={registerData.phone}
                                    minLength={10}
                                    required
                                />
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-1.5">
                            <label
                                htmlFor="password"
                                className="text-sm font-bold text-(--b1)"
                            >Kata Sandi</label>
                            <div className="flex relative">
                                <input
                                    type={isShowPassword ? "text" : "password"} id="password" name="password"
                                    className="w-full border-(--b1) border-2 outline-0 p-2.5 rounded-sm text-sm"
                                    minLength={8}
                                    placeholder="Minimal Memasukkan 8 Kata"
                                    onInput={handleChange}
                                    value={registerData.password}
                                    required
                                />
                                {isShowPassword ? <Image
                                    className="absolute right-2.5 top-2.5"
                                    src="/icons/ic_eye.svg"
                                    width={25}
                                    height={25}
                                    alt="ic-eye"
                                    onClick={() => handleShowPassword()}
                                /> : <Image
                                    className="absolute right-2.5 top-2.5"
                                    src="/icons/ic_closed_eye.svg"
                                    width={25}
                                    height={25}
                                    alt="ic-eye"
                                    onClick={() => handleShowPassword()}
                                />}
                            </div>
                            {isShowErrorMessage.password_no_match ? <p className="text-sm text-(--status-reject)">Kata sandi yang dimasukkan berbeda dengan konfirmasi password!</p> : <></>}
                        </div>

                        <div className="w-full flex flex-col gap-1.5">
                            <label
                                htmlFor="confirm_password"
                                className="text-sm font-bold text-(--b1)"
                            >Konfirmasi Kata Sandi</label>
                            <div className="flex relative">
                                <input
                                    type={isShowConfirmPassword ? "text" : "password"} id="confirm_password" name="confirm_password"
                                    className="w-full border-(--b1) border-2 outline-0 p-2.5 rounded-sm text-sm"
                                    minLength={8}
                                    placeholder="Minimal Memasukkan 8 Kata"
                                    onInput={handleChange}
                                    value={registerData.confirm_password}
                                    required
                                />
                                {isShowConfirmPassword ? <Image
                                    className="absolute right-2.5 top-2.5"
                                    src="/icons/ic_eye.svg"
                                    width={25}
                                    height={25}
                                    alt="ic-eye"
                                    onClick={() => handleShowPassword("confirm_password")}
                                /> : <Image
                                    className="absolute right-2.5 top-2.5"
                                    src="/icons/ic_closed_eye.svg"
                                    width={25}
                                    height={25}
                                    alt="ic-eye"
                                    onClick={() => handleShowPassword("confirm_password")}
                                />}
                            </div>
                            {isShowErrorMessage.password_no_match ? <p className="text-sm text-(--status-reject)">Kata sandi yang dimasukkan berbeda dengan konfirmasi password!</p> : <></>}
                        </div>



                        <div className="w-full flex gap-2.5">
                            <input
                                type="checkbox" name="asking_if_accepted_rules" id="asking_if_accepted_rules"
                            />
                            <label
                                htmlFor="asking_if_accepted_rules"
                                className="text-sm text-(--b1)"
                            >
                                Setuju dengan kebijakan yang ada
                            </label>
                        </div>
                    </div>
                    <button className="p-2 bg-(--b1) text-background font-bold rounded-sm cursor-pointer">DAFTAR</button>
                    <p className="self-center text-sm">Sudah Punya Akun? <Link href={'/signin'} className="text-(--b1)">Masuk</Link></p>
                </form >

            </div >

        </>

    )
}