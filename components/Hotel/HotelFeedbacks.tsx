"use client"
import { FeedbackHotel } from "@/models/HotelFeedbacks"
import ActionIcon from "../Icons/Action"
import HotelIcons from "../Icons/Hotel"
import { useState } from "react"

export default function HotelFeedbacks({
    feedbacks
} : {
    feedbacks : FeedbackHotel[]
}) {

    const [ showDetail, setShowDetail ] = useState<boolean>(false)

    const [ currentFeedback, setCurrentFeedback ] = useState<FeedbackHotel | null>(null)

    return feedbacks?.length && <div className="flex flex-col justify-between gap-20" id="feedbacks">
        <div className="flex flex-col gap-2">
            <h2 className="font-bold text-center text-3xl">Kamu Mungkin Penasaran Dengan Pengalaman Tamu Sebelumbya?</h2>
            <p className="text-lg text-center">Dibawah ini  adalah pengalaman - pengalaman dari tamu sebelumnya!</p>
        </div>
        <div className="p-8 flex flex-wrap gap-16">
            {feedbacks.map((feedback, index) => {
                return <div className="max-w-100 flex flex-col gap-2.5" key={feedback.guest_name + feedback.id + index}>
                    <div className="flex justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 flex justify-center items-center p-2 text-background bg-(--status-refund) rounded-full">
                                <span className="">{feedback.guest_name[0].toUpperCase()}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span>{feedback.guest_name}</span>
                                <span className="text-sm">{feedback.room_names}</span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <span className="text-sm">{feedback.stars}</span>
                            <HotelIcons className="w-4 h-4 text-(--b4)" name="star" />
                        </div>
                    </div>
                    <span className="text-sm">{feedback.value}</span>
                    <button className="flex items-center gap-2.5 text-(--status-refund) cursor-pointer"
                        onClick={() => {
                            setCurrentFeedback(feedback)
                            setShowDetail(true)
                        }}
                    >
                        <span className="text-sm">Baca Selengkapnya</span>
                        <ActionIcon className="w-6 h-6" name="read_book" />
                    </button>
                </div>
            })}
        </div>

        {showDetail && currentFeedback && <div className="w-full min-h-dvh flex justify-center items-center p-4 fixed top-0 left-0">
            <div className="w-full p-4 border-2 border-(--status-refund) flex flex-col gap-5 bg-white rounded-lg">
                <div className="flex justify-between items-center">
                    <span>Baca Selengkapnya Terkait Pengalaman Tamu</span>
                    <button className="flex items-center gap-1 text-(--status-refund) cursor-pointer"
                        onClick={() => setShowDetail(false)}
                    >
                        <span className="text-sm">Close</span>
                        <ActionIcon className="w-5 h-5" name="close_tight" />
                    </button>
                </div>
                <div className="flex flex-col gap-10 p-2">
                    <div className="w-full flex flex-col gap-5 bg-background p-2 rounded-lg">
                        <div className="flex justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 flex justify-center items-center p-2 text-background bg-(--status-refund) rounded-full">
                                    <span className="">{currentFeedback?.guest_name[0].toUpperCase()}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span>{currentFeedback?.guest_name}</span>
                                    <span className="text-sm">{currentFeedback?.room_names}</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-sm">{currentFeedback?.stars}</span>
                                <HotelIcons className="w-4 h-4 text-(--b4)" name="star" />
                            </div>
                        </div>
                        <span className="text-sm">{currentFeedback?.value}</span>
                    </div>
                </div>
                <div className="w-full flex overflow-x-scroll">
                    {feedbacks.map((feedback, index) => {
                        return <button className="min-w-50 min-h-25 max-w-100 flex flex-col gap-2.5 cursor-pointer text-start" key={feedback.guest_name + feedback.id + index}
                            onClick={() => setCurrentFeedback(feedback)}
                        >
                            <div className="flex justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 flex justify-center items-center p-2 text-background bg-(--status-refund) rounded-full">
                                        <span className="">{feedback.guest_name[0].toUpperCase()}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 ">
                                        <span>{feedback.guest_name}</span>
                                        <span className="text-sm">{feedback.room_names}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <span className="text-sm">{feedback.stars}</span>
                                    <HotelIcons className="w-4 h-4 text-(--b4)" name="star" />
                                </div>
                            </div>
                            <span className="text-sm">{feedback.value}</span>
                        </button>
                    })}
                </div>
            </div>
        </div>}
    </div>
}