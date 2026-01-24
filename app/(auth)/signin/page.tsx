"use client"

import CallApi from "@/utils/CallApi";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useState } from "react";

interface LoginFormData {
    email: string
    password: string
    role: string
    is_remember: boolean
}

interface ShowErrorMessage {
    email_exist: boolean,
    general_information: ErrorMessage,
}

interface ErrorMessage {
    show: boolean,
    message: string,
}

export default function SignInPage() {
    const router = useRouter();

    const params = useParams();

    const { role = "mitra" } = params

    const [loginData, setLoginData] = useState<LoginFormData>({
        email: "",
        password: "",
        role  : role as string,
        is_remember: false
    });

    const [isShowErrorMessage, setIsShowErrorMessage] = useState<ShowErrorMessage>({
        email_exist: false,
        general_information: {
            show: false,
            message: ""
        },
    });

    const [isShowPassword, setIshowPassword] = useState<boolean>(false);

     function handleShowPassword() {
        setIshowPassword((prev) => !prev)
    }

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setLoginData((prev) => ({
            ...prev,
            [name]: value
        }))
    }


    function handleSubmitForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const api = CallApi();
        api.post("/sign-in", loginData).then((response) => {
            if (response.status === 200) {
                router.push("/signin/verify-otp");
            }else if(response.status === 403){
                router.push("/signup/step_2");
            }
        }).catch((error) => {
            console.error("Error during sign-in:", error);
            if(error.status === 404){
                setIsShowErrorMessage((prev) => {
                    return {
                        ...prev,
                        general_information:{
                            show:true,
                            message: error.response.data.message
                        }
                    }
                })
            }else if(error.status === 403){
                router.push("/signup/step_2");
            }
        });
    }

    return (
        <>
            <div className="w-full p-6 flex flex-col items-center gap-3.5">
                <h2 className="text-3xl font-bold text-(--b1)">MASUK</h2>
                <div className="w-full flex">
                    <ButtonRoleSignIn active={loginData.role == "mitra"}  targetRole="mitra" label="Mitra" setCurrentRole={setLoginData} />
                    <ButtonRoleSignIn active={loginData.role == "mitra_receptionist"}  targetRole="mitra_receptionist" label="Resepsionis" setCurrentRole={setLoginData} />
                </div>
                {isShowErrorMessage.general_information.show? 
                    <p className="text-sm text-(--status-reject)">{isShowErrorMessage.general_information.message}</p>
                : <></>}
                <form
                    action="#"
                    className="w-full flex flex-col gap-2.5"
                onSubmit={handleSubmitForm}
                >
                    <div className="flex flex-col gap-2.5">
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
                                value={loginData.email}
                                required
                            />
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
                                    onChange={handleChange}
                                    value={loginData.password}
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
                        </div>

                        <div className="w-full flex gap-2.5">
                            <input
                                type="checkbox" name="is_remember" id="is_remember"
                                onChange={() => setLoginData((prev) => {
                                    return {
                                        ...prev,
                                        is_remember: !loginData.is_remember
                                    }
                                })}
                            />
                            <label
                                htmlFor="is_remember"
                                className="text-sm text-(--b1)"
                            >
                                Ingat Saya Selama 7 Hari
                            </label>
                        </div>
                    </div>
                    <button className="p-2 bg-(--b1) text-background font-bold rounded-sm cursor-pointer">MASUK</button>
                    <div className="w-full flex justify-between">
                        <p className="self-center text-sm">Belum Punya Akun? <Link href={'/signup'} className="text-(--b1)">Daftar</Link></p>
                        <p className="self-center text-sm">Lupa Kata Sandi? <Link href={'/signup'} className="text-(--b1)">Klik Disini</Link></p>
                    </div>
                </form >

            </div >

        </>

    )
}

function ButtonRoleSignIn({
    active,
    label,
    targetRole,
    setCurrentRole
}: {
    active: boolean,
    label: string
    targetRole: string,
    setCurrentRole : React.Dispatch<React.SetStateAction<LoginFormData>>
}) {

    return (
        <Link
            className={`w-full h-10 flex justify-center items-center
                ${active ? "bg-(--b1) text-background" : "bg-background text-(--b1)"}  font-bold p-1.5 rounded-sm rounded-r-none cursor-pointer`}
            href={`/signin?role=${targetRole}`}
            onClick={() => setCurrentRole(prev => ({ ...prev, role: targetRole }))}
        >
            {label}
        </Link>
    )

}