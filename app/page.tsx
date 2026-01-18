"use client"
import { BookingState, RecomendationText, RecomendationTextResponse, SearchHistoryLocation, ShowInputGuestAndRoom } from "@/components/FindHotel/models";
import Navigation from "@/components/Navigation";
import Api from "@/utils/Api";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import SummaryNights from "@/components/FindHotel/SummaryNight";
import SearchBar from "@/components/FindHotel/SearchBar";
import HistorySearch from "@/components/FindHotel/HistorySearch";
import CategoryProperty from "@/components/FindHotel/CategoryProperty";
import BookingDate from "@/components/FindHotel/BookingDate";
import { useRouter } from "next/navigation";
import BookingIcons from "@/components/Icons/Booking";
import HotelIcons from "@/components/Icons/Hotel";
import Image from "next/image";
import RecommendationPopulerDestination from "@/components/FindHotel/RecommendationDestination";
import FastMenuContainer from "@/components/FindHotel/FastMenuContainer";





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

  const [recomendationTexts, setRecomendationTexts] = useState<RecomendationText | null>()

  const [searchHistory, setSearchHistory] = useState<SearchHistoryLocation[] | []>([])

  const totalNight = Math.round((bookingData.checkOut - bookingData.checkIn) / oneDayMili);


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

   
    fetchApiRecommendation()
    fetchSearchHistory()
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

     <RecommendationPopulerDestination/>

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

      <FastMenuContainer/>

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







