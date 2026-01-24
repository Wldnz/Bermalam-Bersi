"use client"

import CallApi from "@/utils/CallApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface ErrorMessage {
    show: boolean,
    message: string,
}

interface OTPCodeFormData {
    code_1: string,
    code_2: string,
    code_3: string,
    code_4: string,
}

export default function SignInPage() {

    const router = useRouter();

    const [otpCodes, setOtpCodes] = useState<OTPCodeFormData>({
        code_1: "",
        code_2: "",
        code_3: "",
        code_4: "",
    });

    const [isShowErrorMessage, setIsShowErrorMessage] = useState<ErrorMessage>({
        show: false,
        message: ""
    });


    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setOtpCodes((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    function handleSubmitForm(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const api = CallApi();
        console.log("proses respon...")
        api.post("/verification-otp", {
            code_otp: Number(otpCodes.code_1 + otpCodes.code_2 + otpCodes.code_3 + otpCodes.code_4),
        })
        .then(response => {
            console.log("masuk response...")
            if(response.status === 200){
                router.push("/dashboard"); // sementara kesini dlu
            }else if(response.status === 400){
                router.push("/signin");
            }else if(response.status === 404){
                setIsShowErrorMessage({
                    show: true,
                    message: response.data.message,
                })
            }
        })
        .catch(error => {
            console.error("Error during OTP verification:", error);
            if(error.status === 400){
                router.push("/signin");
            }
        })

    }

    return (
        <>
            <div className="w-full h-full p-10 flex flex-col justify-between items-center gap-3.5">
                <div className="flex flex-col justify-center items-center gap-2.5">
                    <h2 className="text-3xl font-bold text-(--b1)">MASUK</h2>
                    <p className="text-sm text-(--b1)">Kami sudah mengirimkan kode ke email anda!</p>
                    {isShowErrorMessage.show ?
                        <p className="text-sm text-(--status-reject)">{isShowErrorMessage.message}</p>
                        : <></>}
                </div>
                <form
                    action="#"
                    className="w-max flex flex-col gap-8"
                    onSubmit={handleSubmitForm}
                >
                    <div className="flex justify-center gap-2.5">
                        <input
                            name="code_1"
                            className="w-12 h-12 text-center font-bold text-(--b1) border-2 border-(--b1) rounded-sm outline-none"
                            type="string" inputMode="numeric"
                            minLength={1}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="code_2"
                            className="w-12 h-12 text-center font-bold text-(--b1) border-2 border-(--b1) rounded-sm outline-none"
                            type="string" inputMode="numeric"
                            minLength={1}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="code_3"
                            className="w-12 h-12 text-center font-bold text-(--b1) border-2 border-(--b1) rounded-sm outline-none"
                            type="string" inputMode="numeric"
                            minLength={1}
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="code_4"
                            className="w-12 h-12 text-center font-bold text-(--b1) border-2 border-(--b1) rounded-sm outline-none"
                            type="string" inputMode="numeric"
                            minLength={1}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="w-full flex flex-col gap-2.5">
                        <button className="p-2 bg-(--b1) text-background font-bold rounded-sm cursor-pointer">MASUK</button>
                        <p className="self-center text-sm">Belum Punya Akun? <Link href={'/signup'} className="text-(--b1)">Daftar</Link></p>
                    </div>
                </form >
                {/* cuman hiasan aja disini wwk */}
                <div className=" w-full h-10"></div>
            </div >

        </>

    )
}
