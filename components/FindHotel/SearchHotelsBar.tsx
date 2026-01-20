"use client"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import { BookingState } from "./models"
import BookingIcons from "../Icons/Booking"
import ActionIcon from "../Icons/Action"
import GetLabelDate from "@/utils/GetLabelDate"
import RecommendationSearch from "./RecommendationSearch"
import Hotel from "@/models/Hotel"
import FetchHotels from "@/utils/FetchHotels"
import isDataHasBeenUpdate from "@/utils/CheckIsBookingDataIsUpdated"

export default function SearchHotelBar({
    value,
    defaultValue,
    setValue,
    setHotels,
    isUpdatedData,
    setIsUpdatedData
}: {
    value: BookingState,
    defaultValue: BookingState,
    setValue: Dispatch<SetStateAction<BookingState>>,
    setHotels: Dispatch<SetStateAction<Hotel[] | []>>,
    isUpdatedData: boolean,
    setIsUpdatedData: Dispatch<SetStateAction<boolean>>
}) {
    const [showBookingDate, setShowBokingDate] = useState<boolean>(false)
    return <div className="w-full flex flex-col justify-center items-center gap-2.5">
        {isUpdatedData && <div className="w-full text-center bg-background p-2">
            <span>Kamu Telah Merubah Data Pemesanan Tempat Bermalam, </span>
            <button className="text-(--status-refund) cursor-pointer"
                onClick={() => {
                    FetchHotels(setHotels, value)
                    setIsUpdatedData(false)
                }}
            >Klik Disini Untuk Mencocokan Kembali</button>
        </div>}
        <div className="w-full flex justify-center items-center gap-2.5">
            <form
                className={`w-210 h-12 px-1 flex justify-between items-center border-2 border-(--status-refund) rounded-2xl relative`}
                onSubmit={(e) => {
                    e.preventDefault()
                    FetchHotels(setHotels, value)
                }}
                onInput={() => setIsUpdatedData(isDataHasBeenUpdate(defaultValue, value))}
            >
                <button className="px-2 h-full border-r-2 border-(--status-refund) cursor-pointer"
                    type="submit"
                >
                    <ActionIcon className="w-8 h-8 text-(--status-refund)" name="search" />
                </button>
                <div className="w-full h-full flex">
                    {showBookingDate ? <>
                        <BookingDate setBookingDate={setValue} bookingDate={value} isCheckin={true} />
                        <BookingDate setBookingDate={setValue} bookingDate={value} isCheckin={false} />
                        <SelectGuest value={value} setValue={setValue} />
                        <SelectTotalRooms value={value} setValue={setValue} />
                    </> : <input
                        className="w-full outline-none px-2"
                        placeholder="Cari Nama Hotel Atau Lokasi Yang Ingin Kamu Tuju!"
                        aria-describedby="find hotel, search hotel, temukan hotel, nama hotel"
                        type="text"
                        value={value.search}
                        onChange={(e) => setValue(prev => {
                            return {
                                ...prev,
                                ...{ search: e.target.value }
                            }
                        })}
                    />}
                </div>
                <button className="px-2 h-full cursor-pointer"
                    onClick={() => setShowBokingDate(prev => !prev)}
                    type="button"
                >
                    <ActionIcon className="w-5 h-5 text-(--status-refund)" name={showBookingDate ? "close_tight" : "hamburger-menu"}
                    />
                </button>
                {!showBookingDate && defaultValue.search != value.search && <RecommendationSearch setValue={setValue} value={value} />}
            </form>
            <button className="p-2 flex justify-center items-center rounded-lg bg-(--status-refund) cursor-pointer">
                <ActionIcon className="w-6 h-6 text-background" name="filter_1" />
            </button>
        </div>
    </div>
}

function BookingDate({
    bookingDate,
    setBookingDate,
    isCheckin,
}: {
    bookingDate: BookingState,
    setBookingDate: Dispatch<SetStateAction<BookingState>>,
    isCheckin: boolean,

}) {
    const currentDate = new Date(bookingDate[isCheckin ? "checkIn" : "checkOut"])
    const ref = useRef(null)
    return <button className="h-full flex items-center gap-2.5 px-2 relative border-x border-(--status-refund)"
        type="button"
        onClick={() => {
            if (ref.current && (ref.current as HTMLInputElement).showPicker) {
                (ref.current as HTMLInputElement).showPicker()
            }
        }}
    >
        <BookingIcons className="w-7 h-7 text-(--status-refund)" name="check_in" />
        <span className="">{GetLabelDate(currentDate)}</span>
        <input
            className="opacity-0 absolute top-0 left-0"
            type="date"
            onChange={(e) => {
                setBookingDate(prev => {
                    return {
                        ...prev,
                        ...{
                            [isCheckin ? "checkIn" : "checkOut"]: new Date(e.target.value).getTime()
                        }
                    }
                })
            }}
            value={currentDate.toISOString().split("T")[0]}
            ref={ref}
        />
    </button>
}

function SelectGuest({
    value,
    setValue,
}: {
    value: BookingState,
    setValue: Dispatch<SetStateAction<BookingState>>
}) {
    const [isShow, setIsShow] = useState<boolean>(false)
    return <div className="w-max h-ful relative">
        <button className="h-full flex items-center px-2 gap-2.5 border-x-2 border-(--status-refund)"
            type="button"
            onClick={() => setIsShow(prev => !prev)}
        >
            <BookingIcons className="w-6 h-6 text-(--status-refund)" name="adult" />
            <span className="">{value.guests.adults} Dewasa, {value.guests.childrens} Anak</span>
        </button>
        <div className={`w-full min-h-3 p-2 ${isShow ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-12 left-0 z-10`}>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="adults" className="text-sm text-start">Dewasa</label>
                <div className="flex justify-center items-center gap-2.5">
                    <div className="p-1 h-7 flex justify-center items-center rounded-lg border-2 border-(--status-refund)">
                        <BookingIcons
                            name="adult"
                            className="w-4 h-4 text-(--status-refund)"
                        />
                    </div>
                    <input type="number" min={1}
                        className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="adults"
                        placeholder=""
                        aria-describedby="Masukkan total orang dewasa, adults, tamu"
                        onChange={(e) => setValue(prev => {
                            return {
                                ...prev,
                                ...{
                                    guests: {
                                        adults: Number(e.target.value) ? Number(e.target.value) : 1,
                                        childrens: value.guests.childrens
                                    }
                                }
                            }
                        })}
                        value={value.guests.adults}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="childrens" className="text-sm text-start">Anak - Anak</label>
                <div className="flex justify-center items-center gap-2.5">
                    <div className="p-1 h-7 flex justify-center items-center rounded-lg border-2 border-(--status-refund)">
                        <BookingIcons
                            name="adult"
                            className="w-4 h-4 text-(--status-refund)"
                        />
                    </div>
                    <input type="number" min={1}
                        className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="childrens"
                        placeholder=""
                        aria-describedby="Masukkan total Anak - Anak, childrens, tamu"
                        onChange={(e) => setValue(prev => {
                            return {
                                ...prev, ...{
                                    guests: {
                                        childrens: Number(e.target.value),
                                        adults: value.guests.adults
                                    }
                                }
                            }
                        })}
                        value={value.guests.childrens}
                    />
                </div>
            </div>

        </div>
    </div>
}

function SelectTotalRooms({
    value,
    setValue,
}: {
    value: BookingState,
    setValue: Dispatch<SetStateAction<BookingState>>
}) {
    const [isShow, setIsShow] = useState<boolean>(false)
    return <div className="w-max h-ful relative">
        <button className="h-full flex items-center px-2 gap-2.5"
            onClick={() => setIsShow(prev => !prev)}
            type="button"
        >
            <BookingIcons className="w-6 h-6 text-(--status-refund)" name="room" />
            <span className="">{value.totalRooms} Kamar</span>
        </button>
        <div className={`w-full min-h-3 p-2 ${isShow ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-12 left-0 z-10`}>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="adults" className="text-sm text-start">Total Kamar</label>
                <div className="flex justify-center items-center gap-2.5">
                    <div className="p-1 h-7 flex justify-center items-center rounded-lg border-2 border-(--status-refund)">
                        <BookingIcons
                            name="room"
                            className="w-4 h-4 text-(--status-refund)"
                        />
                    </div>
                    <input type="number" min={1}
                        className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="adults"
                        placeholder=""
                        aria-describedby="Total Kamar, Kamar, kamar yang akan digunakan"
                        onChange={(e) => setValue(prev => {
                            return {
                                ...prev,
                                ...{
                                    totalRooms: Number(e.target.value) ? Number(e.target.value) : 1
                                }
                            }
                        })}
                        value={value.totalRooms}
                    />
                </div>
            </div>
        </div>
    </div>
}
