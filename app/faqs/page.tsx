"use client"

import ActionIcon from "@/components/Icons/Action"
import Navigation from "@/components/Navigation"
import { Faqs } from "@/models/Faqs"
import Api from "@/utils/Api"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function FaqsPage() {

    const [category, setCategory] = useState<"guest" | "hotel">("guest")

    const [faqs, setFaqs] = useState<Faqs[] | []>([])

    useEffect(() => {
        const fethcingData = async () => {
            try {
                const { data } = await Api().get(`/faqs?category=${category}`)
                setFaqs(data.data)
            } catch {
                setFaqs([])
            }
        }
        fethcingData();
    }, [category])

    return <div className="w-full min-h-dvh flex flex-col gap-10 font-inter">
        <Navigation />
        <div className="w-full min-h-80 flex flex-col gap-8 p-3 py-10 bg-(--status-refund) text-background relative">
            <div className="w-full flex flex-col items-center justify-center gap-1">
                <h2 className="font-bold text-2xl">Bagaimana kami bisa membantu anda?</h2>
                <span className="text-lg text-center">Selamat datang, di halaman bantuan dan dukungan, disini kamu bisa menemukan pertanyaan - <br />pertanyaan yang sering diajukan, dan menghubungi kami</span>
            </div>
            <div className="w-full flex flex-col items-center justif-center gap-2">
                <div className="w-[60%] p-1.5 flex items-center gap-2.5 bg-white rounded-xl">
                    <ActionIcon className="w-10 h-10  text-(--status-refund)" name="search" />
                    <input
                        className="w-full p-1 text-lg text-foreground outline-none"
                        placeholder="Cari pertanyaan disini"
                        type="text"
                    />
                </div>
                <Link
                    href={"/"}
                >&gt; Kembali Ke Halaman Utama?</Link>
            </div>
            <div className="w-full flex justify-center items-center absolute -bottom-12 left-0">
                <div className="w-20 h-20 bg-white rounded-full"></div>
            </div>
        </div>

        <div className="flex flex-col gap-8 px-5">
            <div className="flex items-center gap-2.5">
                <button className={`min-w-50 p-3 text-lg font-bold ${category == "guest" ? "bg-(--status-refund) text-white" : "text-(--status-refund) bg-white"}   border-2 border-(--status-refund) rounded-lg cursor-pointer`}
                    onClick={() => setCategory("guest")}
                >Tamu</button>
                <button className={`min-w-50 p-3 text-lg font-bold ${category == "hotel" ? "bg-(--status-refund) text-white" : "text-(--status-refund) bg-white"} border-2 border-(--status-refund) rounded-lg cursor-pointer`}
                    onClick={() => setCategory("hotel")}
                >Pemilik Hotel</button>
            </div>
            <div className="w-full flex justify-between gap-2.5">
                <div className="w-[50%] flex flex-col gap-2.5">
                    <div className="w-100 flex flex-col gap-1">
                        <span className="text-sm">Bantuan</span>
                        <h2 className="font-bold text-lg">FAQS</h2>
                        <span className="">Kamu memiliki pertanyaan? Tenang kami sudah memiliki jawaban dari pertanyaan - <br />pertanyaan yang ada, Siapa tau pertanyaan kamu ada disana.</span>
                    </div>
                    <button className="w-100 min-w-50 p-2.5 font-bold text-(--status-refund) border-2 border-(--status-refund) bg-white rounded-lg cursor-pointer">Masih Memiliki Pertanyaan?</button>
                </div>
                <div className=" flex"></div>
                <div className="w-full flex flex-col gap-2.5">
                    <div className="flex flex-col gap-4">
                        {faqs.map((faq, index) => {
                            return <details className="group cursor-pointer" key={'key-index'+index}>
                                <summary className="p-3 flex justify-between items-center bg-(--status-refund) text-background rounded-lg outline-none group-open:rounded-b-none">
                                    <span className="text-lg font-bold">{ faq.question }</span>
                                    <div>
                                        <ActionIcon className="w-7 h-7 text-background group-open:hidden" name="positive" />
                                        <ActionIcon className="w-7 h-7 text-background hidden group-open:block" name="negative" />
                                    </div>
                                </summary>
                                <p className="p-4 bg-background group-open:rounded-b-lg">{ faq.answer }</p>
                            </details>
                        })}
                    </div>
                </div>
            </div>
        </div>

    </div >
}