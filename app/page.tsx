"use client"
import { BookingState, RecomendationText, RecomendationTextResponse, SearchHistoryLocation, ShowInputGuestAndRoom } from "@/components/FindHotel/models";
import Navigation from "@/components/Navigation";
import Api from "@/utils/Api";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import SummaryNights from "@/components/FindHotel/SummaryNight";
import SearchBar from "@/components/FindHotel/SearchBar";
import HistorySearch from "@/components/FindHotel/HistorySearch";
import CategoryProperty from "@/components/FindHotel/CategoryProperty";
import BookingDate from "@/components/FindHotel/BookingDate";
import { useRouter } from "next/navigation";
import BookingIcons from "@/components/Icons/Booking";
import HotelIcons from "@/components/Icons/Hotel";
import ActionIcon from "@/components/Icons/Action";
import Image from "next/image";

interface FAQS {
  question: string
  answer: string
}



export default function Home() {
  const router = useRouter()
  const checkInRef = useRef(null)
  const checkOutRef = useRef(null)

  const currentTimeMili = new Date().getTime()
  const oneDayMili = 60 * 60 * 24 * 1000

  const [bookingData, setBookingData] = useState<BookingState>({
    checkIn: currentTimeMili,
    checkOut: oneDayMili + currentTimeMili, // satu hari setelah checkout
    guests: {
      adults: 1,
      childrens: 1
    },
    totalRooms: 1,
    category: "all",
    search: "",
  })

  const [searchDebounce] = useDebounce(bookingData.search, 500)

  const [showInputGuestAndRoom, setShowInputGuestAndRoom] = useState<ShowInputGuestAndRoom>({
    guest: false,
    room: false,
  })

  const [faqs, setFaqs] = useState<FAQS[] | []>([])

  const [recomendationTexts, setRecomendationTexts] = useState<RecomendationText | null>()

  const [searchHistory, setSearchHistory] = useState<SearchHistoryLocation[] | []>([])

  const totalNight = Math.round((bookingData.checkOut - bookingData.checkIn) / oneDayMili);

  const [currentTabMenu, setcurrentTabMenu] = useState<"helper" | "faqs" | "join" | string>("helper")

  function createQueryFindHotels() {
    const query = `search=${bookingData.search}&category_property=${bookingData.category}&check_in=${bookingData.checkIn}&check_out=${bookingData.checkOut}&total_adults=${bookingData.guests.adults}&total_childrens=${bookingData.guests.childrens}&total_rooms=${bookingData.totalRooms}`
    return query
  }

  useEffect(() => {

    const api = Api()

    const fetchApiRecommendation = async () => {

      if (searchDebounce.length < 3 || searchDebounce.trim() === "") {
        setRecomendationTexts(null)
        return
      }

      try {
        const { status, data } = await api.get(`/hotel-recomendation-name?search=${searchDebounce}`)

        // recomendations

        if (status == 200 && (data.data as RecomendationTextResponse[]).length > 0) {
          const locationMaps = new Map()

          const datas = (data.data as RecomendationTextResponse[]);

          datas.forEach((recomendation) => {

            if (!locationMaps.has(recomendation.province)) {
              locationMaps.set(recomendation.province, new Set())
            }

            locationMaps.get(recomendation.province).add(recomendation.city)
          })

          const locations = Array.from(locationMaps.entries()).map(location => ({
            province: location[0] as string,
            cities: Array.from(location[1]) as string[],
          }))

          const hotels = datas.map(data => ({
            id: data.hotel_id,
            label: data.label,
          }))

          setRecomendationTexts({
            hotels: hotels,
            locations: locations,
          })

        }

      } catch {
        setRecomendationTexts(null)
      }

    }

    const fetchSearchHistory = async () => {
      const searchHistories = localStorage.getItem('searchHistories')
      if (!searchHistories) {
        localStorage.setItem("searchHistories", JSON.stringify([
          {
            location: "Bandung",
            isLocation: true,
          },
          {
            location: "Hotel AmenKila Luxury Hotels",
            isLocation: false,
          }
        ]))
        return
      }
      const data = JSON.parse(searchHistories)
      setSearchHistory(data)
    }

    const fetchApiFaqs = async () => {
      try {
        const { data, status } = await api.get('/faqs');

        if (status == 200) setFaqs(data.data)

      } catch {
        setFaqs([])
      }
    }


    fetchApiRecommendation()
    fetchSearchHistory()
    fetchApiFaqs()
  }, [searchDebounce])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(`hotels?${createQueryFindHotels()}`)
  }

  return (
    <div className="w-full flex flex-col gap-10">
      <div className="w-full h-dvh bg-[url(/images/dashboard.png)] bg-no-repeat bg-cover relative">

        {/* black nuansa */}

        <div className="w-full h-full bg-foreground opacity-60"></div>

        <div className="w-full h-full p-6 absolute top-0 lef-0 ">
          <Navigation border={false}/>

          <div className="w-ful flex flex-col items-center gap-10 mt-14">

            <div className="w-full flex flex-col items-center gap-3.5 text-background">
              <h2 className="w-full text-center text-3xl font-bold">Selamat Siang!, Mau Bermalam Dimana Nih?</h2>
              <p className="text-xl" >Tenang Aja Kok, Kami sudah menyiapkan banyak tempat untuk bermalam</p>
            </div>

            {/* seaarch bar */}
            <div className="w-[80%] flex flex-col items-center">
              <div className="w-full flex gap-2.5">

                <SummaryNights totalNight={totalNight} />

                <BookingDate
                  checkInRef={checkInRef}
                  checkOutRef={checkOutRef}
                  setShowInput={setShowInputGuestAndRoom}
                  showInput={showInputGuestAndRoom}
                  setValue={setBookingData}
                  value={bookingData}
                />

              </div>

              <SearchBar bookingData={bookingData} setBookingData={setBookingData} recomendation={recomendationTexts} setRecommendation={setRecomendationTexts} handleSubmit={handleSubmit} />

              <CategoryProperty setValue={setBookingData} value={bookingData} />

              <HistorySearch setValue={setSearchHistory} value={searchHistory} />

            </div>

          </div>

        </div>

      </div>

      <div className="flex flex-col gap-5 p-2 px-5">
        <h2 className="font-bold text-2xl">Temukan Hotel Yang Anda Suka</h2>
        <div className="flex items-center gap-7 flex-wrap">
          <HotelCard />
          <HotelCard />
          <HotelCard />
        </div>
      </div>

      <div className="flex flex-col gap-10  p-5 mt-10">
        <div className="flex flex-col justify-center items-center text-foreground">
          <h2 className="font-bold text-3xl text-(--status-refund)">Mau Liburan Tapi Gak Tau Mau Kemana?</h2>
          <p className="text-xl">Tenang Aja, Kami sudah membuatkan rekomendasi yang mungkin cocok untuk kamu kunjungi ya!</p>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold">DESTINASI POPULER PADA BALI</h2>

          <div className="flex gap-3.5">
            <PopulerDestinationCard />

          </div>

        </div>
      </div>

      <div className="flex flex-col gap-10 p-12 mt-10">
        <div className="flex flex-col justify-center items-center gap-1.5 text-foreground">
          <h2 className="font-bold text-3xl text-(--status-refund)">Bingung? Mau Cari Tempat Bermalam</h2>
          <p className="text-xl">Tenang Aja, Kami sudah menyiapkan map yang dapat membantu kamu dalam mencari tempat bermalam dan wisata disekitarnya!</p>
        </div>

        {/* <div className="w-full h-200 bg-gray-300 rounded-lg"></div> */}
        <div className="w-full h-200 bg-gray-300 rounded-lg">
          <iframe className="w-full h-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7932.008926381757!2d106.70720173978117!3d-6.263141042761471!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69fa8af9314375%3A0x5e51c87ae2aadd89!2sVilla%20Bintaro%20Regency!5e0!3m2!1sid!2sid!4v1768453049354!5m2!1sid!2sid" width="600" height="450"></iframe>
        </div>

        <div className="flex flex-col items-center gap-6 text-foreground">
          <h2 className="font-bold text-3xl">Baca Yuk Biar Tahu</h2>
          <div className="flex items-center gap-2.5">

            <div className="flex gap-2.5">
              <div className="w-4 h-4 rounded-full bg-(--status-refund)"></div>
              <div className="flex flex-col gap-1.5">
                <p>Lokasi Tempat Bermalam</p>
                <p className="max-w-80">Poin ini menunjukan kepada kamu terkait tempat - tempat untuk bermalam.</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="w-4 h-4 rounded-full bg-(--status-wait)"></div>
              <div className="flex flex-col gap-1.5">
                <p>Lokasi Tempat Bermalam</p>
                <p className="max-w-80">Poin ini menunjukan kepada kamu terkait tempat - tempat untuk bermalam.</p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <div className="w-4 h-4 rounded-full bg-(--status-done)"></div>
              <div className="flex flex-col gap-1.5">
                <p>Lokasi Tempat Bermalam</p>
                <p className="max-w-80">Poin ini menunjukan kepada kamu terkait tempat - tempat untuk bermalam.</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="w-full flex gap-2.5 p-20">
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
    </div>
  );
}


function HotelCard() {
  return <div className="">
    <div className="w-full">
      <Image
        className="rounded-t-lg"
        width={320}
        height={10}
        src={"/images/dashboard.png"}
        alt="hotel-images-"
      />
    </div>
    <div className="flex flex-col py-2 gap-2.5">
      <h4 className="text-lg font-bold">Hotel AmenKila Luxury</h4>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <HotelIcons
            className="w-5 h-5 text-(--status-wait)"
            name="star"
          />
          <HotelIcons
            className="w-5 h-5 text-(--status-wait)"
            name="star"
          />
          <HotelIcons
            className="w-5 h-5 text-(--status-wait)"
            name="star"
          />
          <HotelIcons
            className="w-5 h-5 text-(--status-wait)"
            name="star"
          />
          <HotelIcons
            className="w-5 h-5 text-(--status-wait)"
            name="star"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <BookingIcons
            className="w-4 h-4 text-(--status-refund)"
            name="room"
          />
          <span className="text-sm text-(--status-refund)">Kamar Terakhir</span>
        </div>
      </div>

      <div className="w-full px-2 flex justify-between items-center">
        <div className="p-1 flex justify-center items-center self-end bg-(--status-refund) rounded-lg">
          <span className="text-sm text-background">Diskon 20%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-end text-(--status-wait) line-through">Rp. 1.000.000,00</span>
          <span className="font-bold text-lg">Rp. 1.000.000,00</span>
        </div>
      </div>
    </div>
  </div>
}

function PopulerDestinationCard() {

  const populerDestination = [
    {
      name : "Pantai Kuta",
      description : "Pantai kut adalah tempat wisata yng cocok untuk kamu yang ingin surfing dan lain lain-lainya",
      location : "Pantai Barat",
      image_url : "/images/populer_destination/pantai_kuta.jpg"
    },
    {
      name : "Pantai Kuta",
      description : "Pantai kut adalah tempat wisata yng cocok untuk kamu yang ingin surfing dan lain lain-lainya",
      location : "Pantai Barat",
      image_url : "/images/populer_destination/pantai_kuta.jpg"
    },
    {
      name : "Tanah Lot",
      description : "Tanah Lot adalah tempat wisata yng cocok untuk kamu yang ingin surfing dan lain lain-lainya yang cihuy banget...",
      location : "Pantai Barat",
      image_url : "/images/populer_destination/tanah_lot_bali.jpg"
    },
    {
      name : "Tanjung Benoa",
      description : "Tanjung benoa adalah pusat watersport yangs seru pada bali, dengan ombak yang tenang, tempat ini cocok untuk berbagai aktivitas air yang menantang adrenalin dan sangat cocok untuk pemula.",
      location : "Pantai Barat",
      image_url : "/images/populer_destination/tanjung_benoa.webp"
    },
    {
      name : "Ubud",
      description : "Mau lihat kera liar di habitat aslinya? Ubud Monkey Forest ini adalah tempatnya!",
      location : "Pantai Timur",
      image_url : "/images/populer_destination/ubud.webp"
    },
    {
      name : "Taman Nasional Bali Barat",
      description : "Taman Nasional Bali Barat adalah tempat yang sangat amat cocok untuk kamu kunjungi!",
      location : "Pantai Timur",
      image_url : "/images/populer_destination/taman_nasional_barat.webp"
    }

  ]


  return populerDestination.map((destination, index) => {
    return <div className="group w-60 h-100 hover:w-180 relative"
    key={`destination-index-${index}`}>
    <Image
      className="w-full h-full "
      width={400}
      height={10}
      src={destination.image_url}
      alt={`destination-image-${destination.name}`}
    />
    <div className="w-full h-full bg-foreground opacity-60 absolute top-0 left-0"></div>
    <div className="flex flex-col gap-2.5 text-background absolute bottom-3 left-3">
      <h2 className="font-bold text-2xl text-background group-hover:text-(--status-wait)">{destination.name}</h2>
      <div className="hidden flex-col gap-2.5 group-hover:flex">
        <p className="text-lg">{destination.description}</p>
        <button className="w-max text-lg font-bold border-2 border-background p-2.5 rounded-lg cursor-pointer outline-none"
        >Lihat Tempat Bermalam Disekitar</button>
      </div>
    </div>
  </div>
  })
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
