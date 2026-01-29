"use client"
import ActionIcon from "@/components/Icons/Action";
import Navigation from "@/components/Navigation";
import Api from "@/utils/Api";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface FormDataProps {
    first_name: string
    last_name: string
    email: string // ini bakal gak bisa ke ubah ya!
    phone_country_code: string
    phone: string

    country?: string
    city?: string
    address?: string
    zip_code?: string

    // avatar_images 

    is_general_information_update: boolean
    is_location_update: boolean
    is_image_update: boolean
}

interface ResponseProfileData {
    user: {
        first_name: string
        last_name: string
        email: string
        phone_country_cod: string
        phone: string
        image_url: string
    },
    address: {
        id: number
        address: string
        country: string
        city: string
        zip_code: string
        created_at: number
        upadated_at: number
        is_has_address: boolean
    },
    total_transactions: number
}

export default function ProfilePage() {

    const [profile, setProfile] = useState<ResponseProfileData | null>(null)

    useEffect(() => {
        if (!profile) {
            fetchingProfile(setProfile)
        }
    }, [profile]);


    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />

        <div className="w-full flex flex-col gap-10 p-5">
            <div className="w-full flex justify-between items-center gap-2.5 border-b-2 border-background py-2">
                <h2 className="text-xl font-bold">Informasi Pribadi</h2>
                <button className="w-max p-2 text-background bg-(--status-refund) rounded-lg cursor-pointer">
                    <span className="text-lg font-bold">Simpan Perubahan</span>
                </button>
            </div>

            {profile && <div className="flex gap-5 pb-10 border-b-2 border-b-gray-200">
                <div className="flex flex-col gap-7 items-center">
                    <button className="w-max h-max relative cursor-pointer">
                        <Image
                            className="h-70 rounded-lg"
                            src={"/images/dashboard.png"}
                            width={400}
                            height={400}
                            alt="image-profile"
                        />
                        <input
                            className="w-full h-full opacity-0 absolute top-0 left-0 cursor-pointer z-10"
                            type="file" name="avatar_images" id="avatar_images" />
                        <div className="w-full p-1.5 flex justify-center items-center bg-foreground rounded-b-lg absolute bottom-0 left-0 cursor-pointer">
                            <ActionIcon className="w-8 h-8 text-background" name="camera" />
                        </div>
                    </button>
                    <button className="p-2 px-3 border-2 border-(--status-refund) text-(--status-refund) font-bold rounded-lg cursor-pointer"
                    >Lupa Kata Sandi?</button>
                </div>

                <form
                    className="w-full flex flex-col gap-4"
                    action=""
                >
                    <div className="w-full flex items-center justify-between gap-5">
                        <CustomInputTextProfile
                            label="Nama Depan"
                            name="first_name"
                            placeholder="Masukkan Nama Depan"
                            value={profile.user.first_name}
                            setValue={setProfile}
                        />
                        <CustomInputTextProfile
                            label="Nama Belakang"
                            name="last_name"
                            placeholder="Masukkan Nama Belakang"
                            value={profile.user.last_name}
                            setValue={setProfile}
                        />
                    </div>

                    {/*  */}

                    <div className="w-full flex items-center justify-between gap-5">
                        <CustomInputTextProfile
                            label="Alamat Email"
                            name="email"
                            placeholder="john@example.com"
                            value={profile.user.email}
                            setValue={setProfile}
                            isActive={false}
                        />
                        <CustomInputTextPhone
                            label="Nomor Telepon"
                            name="phone"
                            placeholder="Masukkan Nomor Telepon"
                            value={profile.user.phone}
                            setValue={setProfile}
                        />
                    </div>

                    <div className="w-full flex items-center justify-between gap-5">
                        <CustomInputTextAddress
                            label="Negara"
                            name="country"
                            placeholder="Indonesia"
                            value={profile.address.country}
                            setValue={setProfile}
                        />
                        <CustomInputTextAddress
                            label="Kota"
                            name="city"
                            placeholder="Tangerang Selatan"
                            value={profile.address.city}
                            setValue={setProfile}
                        />
                    </div>

                    <div className="w-full flex items-center justify-between gap-5">
                        <CustomInputTextAddress
                            label="Alamat"
                            name="address"
                            placeholder="Masukkan Alamat Kamu!"
                            value={profile.address.address}
                            setValue={setProfile}
                        />
                        <CustomInputTextAddress
                            label="Kode Pos"
                            name="zip_code"
                            placeholder="15252"
                            value={profile.address.zip_code ? profile.address.zip_code : ""}
                            setValue={setProfile}
                        />
                    </div>

                </form>

            </div>}

        </div>
    </div>
}

const CustomInputTextProfile = (
    {
        label,
        name,
        placeholder,
        value,
        setValue,
        isActive = true
    }: {
        label: string
        name: string
        placeholder?: string
        value: string
        setValue: Dispatch<SetStateAction<ResponseProfileData | null>>
        isActive?: boolean
    }
) => {
    return <div className="w-full flex flex-col gap-2">
        <label htmlFor={name} className="font-medium font-lg">{label}</label>
        <input
            className="border-2 border-(--status-refund) rounded-lg p-2.5 px-2 outline-none"
            type="text" id={name} name={name}
            min={3} placeholder={placeholder}
            disabled={!isActive}
            value={value}
            onChange={(e) => setValue(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    ...{
                        user: {
                            ...prev.user,
                            ...{
                                [e.target.name]: e.target.value,
                            },
                        }
                    }
                }
            })}
            required />
    </div>
}

const CustomInputTextAddress = (
    {
        label,
        name,
        placeholder,
        value,
        setValue,
        isActive = true
    }: {
        label: string
        name: string
        placeholder?: string
        value: string
        setValue: Dispatch<SetStateAction<ResponseProfileData | null>>
        isActive?: boolean
    }
) => {
    return <div className="w-full flex flex-col gap-2">
        <label htmlFor={name} className="font-medium font-lg">{label}</label>
        <input
            className="border-2 border-(--status-refund) rounded-lg p-2.5 px-2 outline-none"
            type="text" id={name} name={name}
            min={3} placeholder={placeholder}
            disabled={!isActive}
            value={value}
            onChange={(e) => setValue(prev => {
                if (!prev) return prev
                return {
                    ...prev,
                    ...{
                        address: {
                            ...prev.address,
                            ...{
                                [e.target.name]: e.target.value
                            }
                        }
                    }
                }
            })}
            required />
    </div>
}

const CustomInputTextPhone = (
    {
        label,
        name,
        placeholder,
        value,
        setValue,
        isActive = true
    }: {
        label: string
        name: string
        placeholder?: string
        value: string
        setValue: Dispatch<SetStateAction<ResponseProfileData | null>>
        isActive?: boolean
    }
) => {
    return <div className="w-full h-max flex flex-col gap-2">
        <label htmlFor={name} className="font-medium font-lg">{label}</label>
        <div className="h-max flex items-center gap-1">
            <select
                className="w-max min-h-12 h-full border-2 border-(--status-refund) rounded-lg outline-none cursor-pointer"
                name="phone_country_code" id="phone_country_code"
            >
                <option value="62">+62</option>
            </select>
            <input
                className="w-full border-2 border-(--status-refund) rounded-lg p-2.5 px-2 outline-none"
                type="text" id={name} name={name}
                min={3} placeholder={placeholder}
                disabled={!isActive}
                value={value}
                onChange={(e) => setValue(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        ...{
                            address: {
                                ...prev.address,
                                ...{
                                    [e.target.name]: e.target.value
                                }
                            }
                        }
                    }
                })}
                required />
        </div>
    </div>
}

const fetchingProfile = async (setProfile: Dispatch<SetStateAction<ResponseProfileData | null>>) => {
    try {
        const { data } = await Api().get("/profile")
        setProfile(data.data)
    } catch {
        setProfile(null)
    }
}