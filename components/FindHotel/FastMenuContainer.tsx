"use client"

import { FAQS } from "@/models/Models"
import Api from "@/utils/Api"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import ActionIcon from "../Icons/Action"

export default function FastMenuContainer() {

    const [faqs, setFaqs] = useState<FAQS[] | []>([])
    const [currentTabMenu, setcurrentTabMenu] = useState<"helper" | "faqs" | "join" | string>("helper")

    useEffect(() => {
        const fetchApiFaqs = async () => {
            try {
                const { data, status } = await Api().get('/faqs');

                if (status == 200) setFaqs(data.data)

            } catch {
                setFaqs([])
            }
        }
        fetchApiFaqs()
    }, [])

    return <div className="w-full flex gap-2.5 p-20">
        <div className="flex flex-col gap-2.5">
            <MenuContainerButton
                currentTabMenu={currentTabMenu}
                setMenuTab={setcurrentTabMenu}
                label="Ada Masalah?"
                name="helper"
            />
            <MenuContainerButton
                currentTabMenu={currentTabMenu}
                setMenuTab={setcurrentTabMenu}
                label="Ada Pertanyaan?"
                name="faqs"
            />
            <MenuContainerButton
                currentTabMenu={currentTabMenu}
                setMenuTab={setcurrentTabMenu}
                label="Bergabung Dengan Kami"
                name="join"
            />

        </div>

        <MenuContainer currentTab={currentTabMenu} faqs={faqs} />

    </div>
}

function MenuContainer({
    currentTab,
    faqs,
}: {
    currentTab: string,
    faqs: FAQS[]
}) {
    switch (currentTab) {
        case "helper":
            return <NeedHelpContainer />
        case "faqs":
            return <FaqContainer faqs={faqs} />
        case "join":
            return <JoinWithUsContainer />
    }
}

function MenuContainerButton({
    currentTabMenu,
    label,
    name,
    setMenuTab
}: {
    currentTabMenu: string,
    name: string,
    label: string,
    setMenuTab: Dispatch<SetStateAction<string>>
}) {
    return <button className={`w-50 h-20 p-3 flex justify-center items-center border-2 ${currentTabMenu == name ? "bg-(--status-refund) text-background" : "bg-background text-(--status-refund)"} border-2 border-(--status-refund) rounded-lg`}
        onClick={() => setMenuTab(name)}
    >
        <h2 className="font-bold text-xl text-start">{label}</h2>
    </button>
}

function FaqContainer({
  faqs
}: {
  faqs: FAQS[] | []
}) {
  return <div className="w-full flex flex-col border-2 border-(--status-refund) rounded-lg p-3">
    <h2 className="text-2xl font-bold text-(--status-refund)">Kamu memiliki banyak Pertanyaan?</h2>
    <p>Coba lihat pertanyaan - pertanyaan dibawah ini, siapa tau ngejawab!</p>
    <div className="flex flex-col gap-2.5 mt-3">
      {faqs.map(faq => {
        return <FaqCard answer={faq.answer} question={faq.question} key={`${faq.question}-${faq.answer}`} />
      })}
    </div>
    <div className="flex flex-col gap-2.5 mt-2">
      <button className="p-3 py-3 bg-(--status-refund) font-bold text-background rounded-sm cursor-pointer">Masih Memiliki Pertanyaan?</button>
    </div>
  </div>
}

function NeedHelpContainer() {
  return <div className="w-full h-max flex flex-col gap-2 border-2 border-(--status-refund) rounded-lg p-3">
    <h2 className="text-2xl font-bold text-(--status-refund)">Kamu Sedang Mengalami Kendala?</h2>
    <div className="flex flex-col gap-2.5">
      <p>Tenang Aja!, kami siap membantu anda dalam menyelesaikan masalah - masalah yang sedang dihadapi</p>
      <p>Segera laporkan masalah anda kepada kami! Kami siap 24/7!</p>
    </div>
    <button className="w-max p-2.5 font-bold text-lg text-(--status-refund) border-2 border-(--status-refund) rounded-lg">Laporkan Masalah Kamu</button>
  </div>
}

function JoinWithUsContainer() {
  return <div className="w-full h-max flex flex-col gap-2 border-2 border-(--status-refund) rounded-lg p-3">
    <h2 className="text-2xl font-bold text-(--status-refund)">Kamu Mau Tempat Bermalam Kamu Terlihat Disini?</h2>
    <div className="flex flex-col gap-2.5">
      <p>Bisa bangettt nih kalo tempat bermalam kamu terlihat disini, <br />Dengan bergabung bersama kami maka kamu bisa menikmati banyak keuntungan untuk tempat bermalam kamu lho!</p>
    </div>
    <button className="p-3 py-3 bg-(--status-refund) font-bold text-background rounded-sm cursor-pointer"
    >Mau Dong Bergabung</button>
  </div>
}

function FaqCard({
  question,
  answer
}: {
  question: string,
  answer: string,
}) {
  return <details className="group">
    <summary className="flex justify-between items-center bg-(--status-refund) p-3 rounded-lg group-open:rounded-b-none">
      <p className="font-bold text-background">{question}</p>
      <ActionIcon
        className="w-5 h-5 group-open:hidden text-background"
        name="arrow-up"
      />
      <ActionIcon
        className="w-5 h-5 hidden group-open:block text-background"
        name="close_tight"
      />
    </summary>
    <p className="p-2 bg-(--b3) rounded-b-lg">{answer}</p>
  </details>
}