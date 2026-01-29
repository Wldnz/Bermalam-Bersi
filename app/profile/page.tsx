"use client"
import ActionIcon from "@/components/Icons/Action";
import BookingIcons from "@/components/Icons/Booking";
import HotelCategoryIcon from "@/components/Icons/CategoryHotel";
import TransactionIcons from "@/components/Icons/Transactions";
import Navigation from "@/components/Navigation";
import ShowAlert from "@/components/ShowAlert";
import { AxiosErrorCustom } from "@/models/Models";
import { ShowAlertProps } from "@/models/ShowAlertProps";
import Api from "@/utils/Api";
import SetShowAlertStateAction from "@/utils/SetShowAlert";
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
        phone_country_code: string
        phone: string
        image_url: string
        is_general_information_update: boolean
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
        isChanged: boolean
    },
    total_transactions: number
}

interface AvatarImageProps {
    url: string | null
    File: File | null
    Ischanged: boolean
}

interface ResponseUpdatedProfileUser {
    message: string
    status_code: number
    status_updated: {
        is_general_updated: false,
        is_location_account_updated: false,
        is_avatar_updated: true
    }
}

interface RequestNewPassword {
    password: string
    new_password: string
    confirm_password: string
}

export default function ProfilePage() {

    const [profile, setProfile] = useState<ResponseProfileData | null>(null)

    const [avatarImage, setAvatarImage] = useState<AvatarImageProps>()

    const [showAlertProps, setShowAlertProps] = useState<ShowAlertProps>()

    const [showPasswordAlertProps, setShowPasswordAlertProps] = useState<ShowAlertProps>()

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLoadingPassword, setIsLoadingPassword] = useState<boolean>(false)

    const [changePasswordData, setChangePassowrdData] = useState<RequestNewPassword>({
        confirm_password: "",
        new_password: "",
        password: "",
    })

    useEffect(() => {
        if (!profile) {
            fetchingProfile(setProfile)
        }
    }, [profile]);


    return <div className="w-full min-h-dvh flex flex-col font-inter">
        <Navigation />

        {showAlertProps && showAlertProps.iShowed && <ShowAlert
            showedAlertProps={showAlertProps}
            setShowedAlertProps={setShowAlertProps}
        />}

        {showPasswordAlertProps && showPasswordAlertProps.iShowed && <ShowAlert
            showedAlertProps={showPasswordAlertProps}
            setShowedAlertProps={setShowPasswordAlertProps}
        >
            <form className="w-full flex flex-col gap-6"
                onSubmit={(e) => e.preventDefault()}
            >
                <CustomInputPassword
                    label="Kata Sandi (Lama)"
                    name="password"
                    setValue={setChangePassowrdData}
                    value={changePasswordData}
                />

                <CustomInputPassword
                    label="Kata Baru"
                    name="new_password"
                    setValue={setChangePassowrdData}
                    value={changePasswordData}
                />

                <CustomInputPassword
                    label="Konfirmasi Kata Sandi"
                    name="confirm_password"
                    setValue={setChangePassowrdData}
                    value={changePasswordData}
                />

            </form>
        </ShowAlert>}

        <form className="w-full flex flex-col gap-10 p-5"
            onSubmit={async (e) => {
                e.preventDefault()
                if (isLoading) return
                const formData = new FormData(e.target as HTMLFormElement)
                formData.append("is_general_information_update", convertBooleanIntoString(profile?.user.is_general_information_update ?? false))
                formData.append("is_location_update", convertBooleanIntoString(profile?.address.isChanged ?? false))
                formData.append("is_image_update", convertBooleanIntoString(avatarImage?.Ischanged ?? false))

                setIsLoading(true)

                try {
                    const { data } = await Api().put("/profile", formData)

                    if (data.status_updated) {
                        const { status_updated, message } = data as ResponseUpdatedProfileUser
                        const { is_avatar_updated, is_general_updated, is_location_account_updated } = status_updated

                        const additionalInformationData = []

                        if (profile?.user.is_general_information_update) {
                            additionalInformationData.push({
                                label: "Merubah Informasi Umum Akun",
                                isSuccess: is_general_updated,
                            })
                        }

                        if (profile?.address.isChanged) {
                            additionalInformationData.push({
                                label: "Merubah Alamat Akun",
                                isSuccess: is_location_account_updated,
                            })
                        }

                        if (avatarImage?.Ischanged) {
                            additionalInformationData.push({
                                label: "Merubah Avatar",
                                isSuccess: is_avatar_updated,
                            })
                        }

                        console.log(additionalInformationData);

                        SetShowAlertStateAction({
                            title: "Berhasil Merubah Data Profil",
                            description: message,
                            AdditionalInformation: additionalInformationData,
                            category: "success",
                            iShowed: true
                        }, setShowAlertProps)
                    } else {
                        SetShowAlertStateAction({
                            title: "Tidak Ada Perubahan Pada Data",
                            description: data.message,
                            category: "information",
                            iShowed: true
                        }, setShowAlertProps)
                    }



                } catch (err) {
                    console.log(err);
                    const errorCustom = err as AxiosErrorCustom
                    SetShowAlertStateAction({
                        title: errorCustom.status === 500 ? "Telah Terjadi Error" : "Pemberitahuan",
                        description: errorCustom.response?.data.message,
                        category: errorCustom.status === 500 ? "error" : "information",
                        iShowed: true
                    }, setShowAlertProps)
                } finally {
                    setAvatarImage(undefined)
                    setIsLoading(false)
                }

            }}
        >
            <div className="w-full flex justify-between items-center gap-2.5 border-b-2 border-background py-2">
                <h2 className="text-xl font-bold">Informasi Pribadi</h2>
                {profile && <button className="w-max p-2 flex items-center gap-2.5 text-background bg-(--status-refund) rounded-lg cursor-pointer"
                    type="button"
                >
                    <span className="text-lg font-bold">{isLoading ? "Sedang Menyimpan Perubahan" : "Simpan Perubahan"}</span>
                    {isLoading && <ActionIcon className="w-4 h-4 animate-spin" name="loading" />}
                </button>}
            </div>

            {profile && <div className="flex gap-5 pb-10 border-b-2 border-b-gray-200">
                <div className="flex flex-col gap-7 items-center">
                    <button className="w-max h-max relative cursor-pointer"
                        type="button"
                    >
                        <Image
                            className="h-70 rounded-lg"
                            src={gettingCurrentAvatarImage([avatarImage?.url ?? profile.user.image_url])}
                            width={400}
                            height={400}
                            alt="image-profile"
                        />
                        <input
                            className="w-full h-full opacity-0 absolute top-0 left-0 cursor-pointer z-10"
                            type="file" accept="image/jpg, image/jpeg, image/png, image/webp" name="avatar_image" id="avatar_image"
                            onChange={(e) => {
                                const file = e.target.files![0];
                                if (file) {
                                    const newURL = URL.createObjectURL(file)
                                    setAvatarImage({
                                        Ischanged: true,
                                        File: file,
                                        url: newURL,
                                    })
                                } else {
                                    setAvatarImage({
                                        Ischanged: false,
                                        File: null,
                                        url: null,
                                    })
                                }
                            }}
                        />
                        <div className="w-full p-1.5 flex justify-center items-center bg-foreground rounded-b-lg absolute bottom-0 left-0 cursor-pointer">
                            <ActionIcon className="w-8 h-8 text-background" name="camera" />
                        </div>
                    </button>
                    <button className={`p-2 px-3 flex items-center gap-2.5 border-2 border-(--status-refund) text-(--status-refund) font-bold rounded-lg ${isLoadingPassword? "cursor-not-allowed" : "cursor-pointer"}`}
                        type="button"
                        onClick={() =>{
                            if(isLoadingPassword) return
                            SetShowAlertStateAction(
                                {
                                    title: "Merubah Kata Sandi",
                                    description: "Silahkan Masukkan Kata Sandi Lama Dan Baru Mu Yuk!",
                                    category: "information",
                                    actions: [
                                        {
                                            label: "Merubah Kata Sandi",
                                            handler: async() => {
                                                console.log(changePasswordData)
                                                // return
                                                if(changePasswordData.confirm_password != changePasswordData.new_password) return
                                                setIsLoadingPassword(true)
                                                try{
                                                    await Api().put("/change-password", changePasswordData)
                                                    SetShowAlertStateAction({
                                                        title : "Berhasil Merubah Kata Sandi!",
                                                        description: "Kata Sandi Kamu Telah Berhasil Diubah!",
                                                        category: "success",
                                                        iShowed : true,
                                                    }, setShowAlertProps)
                                                    setChangePassowrdData({
                                                        confirm_password : "",
                                                        new_password : "",
                                                        password : ""
                                                    })
                                                }catch (error) {
                                                    const err = error as AxiosErrorCustom
                                                    SetShowAlertStateAction({
                                                        title : err.status == 500 ? "Telah Terjadi Kesalahan" : "Pemberitahuan",
                                                        description: err.response.data.message,
                                                        category: err.status == 500? "error" : "information",
                                                        iShowed : true,
                                                    }, setShowAlertProps)
                                                }finally{
                                                    setIsLoadingPassword(false)
                                                }
                                            }
                                        },
                                    ],
                                    iShowed: true,
                                },
                                setShowPasswordAlertProps)
                        }}
                    >
                        <span>{ isLoadingPassword ? "Merubah Password" : "Lupa Kata Sandi?" }</span>
                        { isLoadingPassword && <ActionIcon className="w-5 h-5 animate-spin" name="loading"/> }
                    </button>
                </div>

                <div
                    className="w-full flex flex-col gap-4"
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
                            phoneValue={profile.user.phone}
                            phoneCountryCodeValue={profile.user.phone_country_code}
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
                            isRequired={profile.address.is_has_address}
                        />
                        <CustomInputTextAddress
                            label="Kota"
                            name="city"
                            placeholder="Tangerang Selatan"
                            value={profile.address.city}
                            setValue={setProfile}
                            isRequired={profile.address.is_has_address}
                        />
                    </div>

                    <div className="w-full flex items-center justify-between gap-5">
                        <CustomInputTextAddress
                            label="Alamat"
                            name="address"
                            placeholder="Masukkan Alamat Kamu!"
                            value={profile.address.address}
                            setValue={setProfile}
                            isRequired={profile.address.is_has_address}
                        />
                        <CustomInputTextAddress
                            label="Kode Pos"
                            name="zip_code"
                            placeholder="15252"
                            value={profile.address.zip_code ? profile.address.zip_code : ""}
                            setValue={setProfile}
                            isRequired={profile.address.is_has_address}
                        />
                    </div>

                </div>

            </div>}

            <div className="w-full flex flex-col gap-5">
                <div className="flex items-center gap-1.5">
                    <ActionIcon className="w-8 h-8 text-(--status-refund)" name="information" />
                    <span className="font-bold text-xl">Kami telah membuat ringkasan untuk kamu!</span>
                </div>
                <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-1.5">
                        <ActionIcon className="w-7 h-7 text-(--status-refund)" name="near" />
                        <span className="text-lg">Kamu telah mengunjungi berbagai hotel</span>
                    </div>
                    <div className="flex items-center gap-4 ml-8">
                        <div className="flex items-center gap-2.5">
                            <HotelCategoryIcon className="w-7 h-7 text-(--status-wait)" name="villa" />
                            <span className="">Sebanyak 200 Kamar Telah Dipesan</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <ActionIcon className="w-7 h-7 text-(--status-done)" name="success" />
                            <span className="">Sebanyak 180 Pemesanan Berhasil</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <TransactionIcons className="w-7 h-7 text-(--status-refund)" name="currency" />
                            <span className="">Sebanyak 10 Pemesanan Dikembalikan</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <ActionIcon className="w-7 h-7 text-(--status-reject)" name="close_outline" />
                            <span className="">Sebanyak 10 Pemesanan Di Batalkan</span>
                        </div>
                    </div>
                </div>
            </div>
        </form>


    </div>
}

const CustomInputPassword = ({
    label,
    name,
    value,
    setValue
}: {
    label: string,
    name: string
    value: RequestNewPassword
    setValue: Dispatch<SetStateAction<RequestNewPassword>>
}) => {

    const [showPassword, setShowPassword] = useState<boolean>(false)

    const isSameOrConfirmPassword = name == "confirm_password" || name == "new_password"
    let isConfirmSameAsNewPassword = false

    if (isSameOrConfirmPassword && value.confirm_password == value.new_password) {
        isConfirmSameAsNewPassword = true
    }


    return <div className="w-full flex flex flex-col gap-2.5">
        <label htmlFor={name} className="font-medium">{label}</label>
        <div className="flex flex-col gap-1">
            <div className="w-full flex p-2 items-center gap-1.5 border-2 border-(--status-refund) rounded-lg">
                <input
                    className="w-full h-full p-1 outline-none rounded-lg"
                    name={name} id={name}
                    placeholder="Masukkan Password Lama Anda!"
                    type={showPassword ? "text" : "password"}
                    value={value[name as keyof RequestNewPassword]}
                    onChange={(e) => setValue(prev => {
                        return {
                            ...prev,
                            ...{
                                [name]: e.target.value
                            }
                        }
                    })}
                    required
                />
                <button className="cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                >
                    <ActionIcon className="w-8 h-8 text-(--status-refund)" name={showPassword ? "eye_close" : "eye"} />
                </button>
            </div>
            { isSameOrConfirmPassword && !isConfirmSameAsNewPassword && name == "confirm_password"  && <span className="text-(--status-reject)">Konfirmasi Kata sandi harus sama dengan kata sandi baru</span> }
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
        isActive = true,
        isRequired = true,
    }: {
        label: string
        name: string
        placeholder?: string
        value: string
        setValue: Dispatch<SetStateAction<ResponseProfileData | null>>
        isActive?: boolean
        isRequired?: boolean
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
            onChange={(e) => {
                setValue(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        ...{
                            user: {
                                ...prev.user,
                                ...{
                                    [e.target.name]: e.target.value,
                                    is_general_information_update: true,
                                },
                            }
                        }
                    }
                })
            }}
            required={isRequired} />
    </div>
}

const CustomInputTextAddress = (
    {
        label,
        name,
        placeholder,
        value,
        setValue,
        isActive = true,
        isRequired = true,
    }: {
        label: string
        name: string
        placeholder?: string
        value: string
        setValue: Dispatch<SetStateAction<ResponseProfileData | null>>
        isActive?: boolean
        isRequired?: boolean
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
            onChange={(e) => {
                setValue(prev => {
                    if (!prev) return prev
                    const newData = {
                        ...prev,
                        ...{
                            address: {
                                ...prev.address,
                                ...{
                                    [e.target.name]: e.target.value,
                                }
                            }
                        }
                    }
                    return {
                        ...newData,
                        ...{
                            address: {
                                ...newData.address,
                                ...{
                                    isChanged: IsHasAddress(newData),
                                }
                            }
                        }
                    }
                })
            }}
            required={isRequired} />
    </div>
}

const CustomInputTextPhone = (
    {
        label,
        name,
        placeholder,
        phoneValue,
        phoneCountryCodeValue,
        setValue,
        isActive = true
    }: {
        label: string
        name: string
        placeholder?: string
        phoneValue: string
        phoneCountryCodeValue: string
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
                value={phoneCountryCodeValue}
                onChange={(e) => setValue(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        ...{
                            user: {
                                ...prev.user,
                                ... {
                                    phone_country_code: e.target.value,
                                }
                            }
                        }
                    }
                })}
            >
                <option value="62">+62</option>
            </select>
            <input
                className="w-full border-2 border-(--status-refund) rounded-lg p-2.5 px-2 outline-none"
                type="text" id={name} name={name}
                min={8} maxLength={28} placeholder={placeholder}
                disabled={!isActive}
                value={phoneValue}
                onChange={(e) => setValue(prev => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        ...{
                            user: {
                                ...prev.user,
                                ...{
                                    phone: e.target.value,
                                    is_general_information_update: true,
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

const gettingCurrentAvatarImage = (urls: string[]): string => {
    let responseURL = "/images/dashboard.png"

    urls.forEach((url) => {
        if (url.trim() != "") {
            responseURL = url
        }
    })

    return responseURL
}

const IsHasAddress = (value: ResponseProfileData | null): boolean => {

    if (!value || !value.address) return false

    if (value.address.id) return true

    for (const key in value.address) {
        if (value.address[key as keyof typeof value.address] && key != "is_has_address" && key != "isChanged") {
            return true
        }
    }

    return false
}

const convertBooleanIntoString = (condition: boolean): string => {
    return condition ? "true" : "false"
}