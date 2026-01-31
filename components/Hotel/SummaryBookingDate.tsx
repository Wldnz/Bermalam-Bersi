"use client"
import { Dispatch, SetStateAction, useRef, useState } from "react"
import ActionIcon from "../Icons/Action"
import BookingIcons from "../Icons/Booking"
import GetLabelDate from "@/utils/GetLabelDate"
import { BookingState } from "../FindHotel/models"
import ShowPopupProps from "@/models/ShowPopup"

export default function SummaryBookingDate({
    bookingDate,
    setBookingDate,
    showPopup,
    setShowPopup,
    handler
}: {
    bookingDate: BookingState,
    setBookingDate: Dispatch<SetStateAction<BookingState>>,
    showPopup: ShowPopupProps,
    setShowPopup: Dispatch<SetStateAction<ShowPopupProps>>,
    handler : () => void
}) {
    const [show, setShow] = useState<boolean>(false)

    return <div className="w-80 p-3 flex flex-col gap-2.5 bg-white border-3 border-(--status-refund) fixed top-10 right-0 rounded-lg rounded-bl-none">
        <span className="">Ringkasan Kunjungan Anda!</span>
        {show && <div className="flex flex-col gap-3">
            <SelectDateCard
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
            />
            <SelectDateCard
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                isCheckIn={false}
            />
            <SelectGuestCard
                bookingDate={bookingDate}
                setBookingDate={setBookingDate}
                setShowPopup={setShowPopup}
                showPopup={showPopup}
            />
            <button className="p-2.5 bg-(--status-refund) text-background font-bold rounded-lg cursor-pointer"
                onClick={handler}
            >Simpan Perubahan</button>
        </div>}
        <button className="w-max p-2 bg-white border-3 border-(--status-refund) rounded-lg rounded-t-none absolute -bottom-10.25 -left-[2.5px] cursor-pointer"
            onClick={() => setShow(prev => !prev)}
        >
            <ActionIcon className="w-5 h-5 text-(--status-refund)" name={show ? "arrow-up" : "arrow-down"} />
        </button>
    </div>
}


const SelectRoomCard = ({
    bookingDate,
    setBookingDate,
    showPopup,
    setShowPopup,
}: {
    bookingDate: BookingState,
    setBookingDate: Dispatch<SetStateAction<BookingState>>,
    showPopup: ShowPopupProps,
    setShowPopup: Dispatch<SetStateAction<ShowPopupProps>>
}) => {
    return <div className="flex flex-col gap-1.5 relative">
        <h4 className="font-bold">Kamar</h4>
        <button className="w-max p-2 flex items-center gap-1 border-2 border-(--status-refund) rounded-lg cursor-pointer"
            onClick={() => setShowPopup(prev => {
                return {
                    ...prev,
                    ...{
                        orders: !prev.rooms,
                        guests: false,
                    }
                }
            })}
        >
            <BookingIcons className="w-7 h-7 text-(--status-refund)" name="room" />
            <span>{bookingDate.totalRooms} Kamar</span>
        </button>
        <div className={`w-full min-h-3 p-2 ${showPopup.booking && showPopup.rooms ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-20 left-0 z-10`}>

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
                        onChange={(e) => setBookingDate(prev => {
                            return {
                                ...prev,
                                ...{
                                    totalRooms: Number(e.target.value) ? Number(e.target.value) : 1
                                }
                            }
                        })}
                        value={bookingDate.totalRooms}
                    />
                </div>
            </div>
        </div>
    </div>
}

const SelectGuestCard = ({
    bookingDate,
    setBookingDate,
    showPopup,
    setShowPopup,
}: {
    bookingDate: BookingState,
    setBookingDate: Dispatch<SetStateAction<BookingState>>,
    showPopup: ShowPopupProps,
    setShowPopup: Dispatch<SetStateAction<ShowPopupProps>>
}) => {
    return <div className="flex flex-col gap-1.5 relative">
        <h4 className="font-bold">Tamu</h4>
        <button className="w-max p-2 flex items-center gap-1 border-2 border-(--status-refund) rounded-lg cursor-pointer"
            onClick={() => setShowPopup(prev => {
                return {
                    ...prev,
                    ...{
                       guests : !prev.guests,
                       rooms : false
                    }
                }
            })}
        >
            <BookingIcons className="w-7 h-7 text-(--status-refund)" name="adult" />
            <span>{bookingDate.guests.adults} Dewasa, {bookingDate.guests.childrens} Anak - Anak</span>
        </button>
        <div className={`w-full min-h-3 p-2 ${showPopup.booking && showPopup.guests ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-20 left-0 z-10`}>

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
                        onChange={(e) => setBookingDate(prev => {
                            return {
                                ...prev,
                                ...{
                                    guests: {
                                        adults: Number(e.target.value) ? Number(e.target.value) : 1,
                                        childrens: bookingDate.guests.childrens
                                    }
                                }
                            }
                        })}
                        value={bookingDate.guests.adults}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5 relative">
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
                        onChange={(e) => setBookingDate(prev => {
                            return {
                                ...prev, ...{
                                    guests: {
                                        childrens: Number(e.target.value),
                                        adults: bookingDate.guests.adults
                                    }
                                }
                            }
                        })}
                        value={bookingDate.guests.childrens}
                    />
                </div>
            </div>

        </div>
        <SelectRoomCard
            bookingDate={bookingDate}
            setBookingDate={setBookingDate}
            setShowPopup={setShowPopup}
            showPopup={showPopup}
        />
    </div>
}


const SelectDateCard = ({
    bookingDate,
    setBookingDate,
    isCheckIn = true
}: {
    bookingDate: BookingState,
    setBookingDate: Dispatch<SetStateAction<BookingState>>,
    isCheckIn?: boolean
}) => {

    const currentRef = useRef(null)

    const currentCategoryDate = isCheckIn ? "checkIn" : "checkOut"

    return <div className="flex flex-col gap-1.5 relative">
        <h4 className="font-bold">{isCheckIn
            ? "Check-In" : "Check-Out"}</h4>
        <button className="w-max p-2 flex items-center gap-1 border-2 border-(--status-refund) rounded-lg cursor-pointer"
            onClick={() => {
                if (currentRef.current && (currentRef.current as HTMLInputElement).showPicker) {
                    (currentRef.current as HTMLInputElement).showPicker()
                }
            }}
        >
            <BookingIcons className="w-7 h-7 text-(--status-refund)" name={isCheckIn ? "check_in" : "check_out"} />
            <span>{GetLabelDate(new Date(bookingDate[currentCategoryDate]))}</span>
        </button>
        <input
            className="absolute top-0 left-0 opacity-0"
            type="date"
            onChange={(e) => setBookingDate(prev => {
                return {
                    ...prev,
                    ...{
                        [currentCategoryDate]: new Date(e.target.value).getTime()
                    }
                }
            })}
            value={(new Date(bookingDate[currentCategoryDate])).toISOString().split("T")[0]}
            ref={currentRef}
        />
    </div>
}
