"use client"
import BookingIcons from "@/components/Icons/Booking";
import Navigation from "@/components/Navigation";
import Api from "@/utils/Api";
import Image from "next/image";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";


interface TotalGuests {
  adults: number
  childrens: number
}

interface ShowInputGuestAndRoom {
  guest: boolean
  room: boolean
}

interface BookingState {
  checkIn: number
  checkOut: number
  totalRooms: number
  guests: TotalGuests
  category: string
  search: string
}

interface RecomendationTextResponse {
  id: number
  hotel_id: number
  label: string
  city: string
  province: string
}

interface RecomendationText {

  locations: {
    province: string
    cities: string[]
  }[]

  hotels: {
    id: number,
    label: string
  }[]

}


export default function Home() {
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

  const [recomendations, setRecomendations] = useState<RecomendationTextResponse[]>([])

  const [ recomendationTexts, setRecomendationTexts ] = useState<RecomendationText | null>()

  const totalNight = Math.round((bookingData.checkOut - bookingData.checkIn) / oneDayMili);

  useEffect(() => {

    const fetchApi = async () => {

      if (searchDebounce.length < 3 || searchDebounce.trim() === "") {
        setRecomendationTexts(null)
        return
      }

      try {
        const { status, data } = await Api().get(`/hotel-recomendation-name?search=${searchDebounce}`)

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
            province : location[0] as string,
            cities : Array.from(location[1]) as string[],
          }))

          const hotels = datas.map(data => ({
            id : data.hotel_id,
            label : data.label,
          }))

          setRecomendationTexts({
            hotels : hotels,
            locations : locations,
          })

        }

      } catch {
        setRecomendations([])
      }

    }
    fetchApi()
  }, [searchDebounce])

  return (
    <>
      <div className="w-full h-dvh bg-[url(/images/dashboard.png)] bg-no-repeat bg-cover relative">

        {/* black nuansa */}

        <div className="w-full h-full bg-foreground opacity-60"></div>

        <div className="w-full h-full p-6 absolute top-0 lef-0 ">
          <Navigation />

          <div className="w-ful flex flex-col items-center gap-10 mt-14">

            <div className="w-full flex flex-col items-center gap-3.5 text-background">
              <h2 className="w-full text-center text-3xl font-bold">Selamat Siang!, Mau Bermalam Dimana Nih?</h2>
              <p className="text-xl" >Tenang Aja Kok, Kami sudah menyiapkan banyak tempat untuk bermalam</p>
            </div>

            {/* seaarch bar */}
            <div className="w-[80%] flex flex-col items-center">
              <div className="w-full flex gap-2.5">
                <div className="h-7 flex items-center self-end gap-4 self bg-(--status-refund) p-2 rounded-lg rounded-b-none">
                  {
                    totalNight <= 1 ? <></> : <div className="flex items-center justify-center gap-1 text-sm">
                      <span className="text-bold text-background">{
                        (totalNight - 1) + " Hari"
                      }</span>
                      <BookingIcons
                        name="sun"
                        className="w-4 h-4 text-(--status-wait)"
                      />
                    </div>
                  }


                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="text-bold text-background">{
                      totalNight <= 1 ? "Semalam" : totalNight + " Malam"
                    }</span>
                    <BookingIcons
                      name="moon"
                      className="w-4 h-4 text-(--status-wait)"
                    />
                  </div>

                </div>

                <div className="flex gap-2.5 p-2">
                  <ButtonSelectDate iconName="check_in" refDate={checkInRef} setValue={setBookingData} value={bookingData.checkIn} isCheckIn={true} />
                  <ButtonSelectDate iconName="check_out" refDate={checkOutRef} setValue={setBookingData} value={bookingData.checkOut} isCheckIn={false} />
                  <ButtonSelectTotalGuest setValue={setBookingData} value={bookingData.guests} setShowInput={setShowInputGuestAndRoom} showInput={showInputGuestAndRoom.guest} />
                  <ButtonSelectTotalRooms setValue={setBookingData} value={bookingData.totalRooms} setShowInput={setShowInputGuestAndRoom} showInput={showInputGuestAndRoom.room} />
                </div>
              </div>

              <div className="w-full p-3 flex items-center gap-2.5 rounded-2xl rounded-tl-none bg-background relative">
                <Image
                  src={"/icons/ic_search.svg"}
                  width={30}
                  height={30}
                  alt="search"
                />
                <input
                  className="w-full min-h-8 outline-none"
                  placeholder="Cari Hotel Atau Lokasi Hotel Disini!"
                  type="text"
                  value={bookingData.search}
                  onChange={(e) => setBookingData(prev => {
                    return {
                      ...prev,
                      ...{
                        search: e.target.value
                      }
                    }
                  })}
                />
                <div className={`w-full p-1.5 ${recomendationTexts?.locations?.length ? "flex" : "hidden"} flex-col gap-2.5 bg-background absolute top-10 left-0 rounded-b-2xl`}>
                  {recomendationTexts?.locations.map(location => {
                    return location.cities.map( (city, index) => {
                      return <button
                      key={`${city}-recommendation-text-${index}`}
                      className="w-full p-1.5 text-start cursor-pointer"
                      onClick={() => {
                        setBookingData(prev => {
                          return {
                            ...prev,
                            ...{
                              search: city
                            }
                          }
                        })
                        setRecomendationTexts(null)
                      }}
                    >
                      {city + ", " + location.province}
                    </button>
                    } )
                  })}
                  {
                    recomendationTexts?.hotels.map((hotel, index) => {
                      return <button
                      key={`${hotel.label}-recommendation-text-${index}`}
                      className="w-full p-1.5 text-start cursor-pointer"
                      onClick={() => {
                        // pindahkan ke halaman detail hotel...
                        setRecomendationTexts(null)
                      }}
                    >
                      {hotel.label}
                    </button>
                    })
                  }
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button className="p-1 px-1.5 text-sm text-background bg-(--status-refund) rounded-xl">Semuanya</button>
              <button className="p-1 px-1.5 text-sm text-background bg-(--status-refund) rounded-xl">Hotel</button>
              <button className="p-1 px-1.5 text-sm text-background bg-(--status-refund) rounded-xl">Villa</button>
              <button className="p-1 px-1.5 text-sm text-background bg-(--status-refund) rounded-xl">Apartemen</button>
            </div>

            <div className="w-full bg-blue-900">
              <h4>Riwayat Pencarian</h4>
              <div className="flex flex-wrap">
                <div className="bg-background p-1.5 rounded-lg text-sm">
                  <span>Hello World</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}


// component dibawah ini akan dipindah ke dalam folder components

function ButtonSelectDate({
  iconName,
  refDate,
  value,
  setValue,
  isCheckIn,
}: {
  iconName: string,
  refDate: RefObject<null>,
  value: number,
  setValue: Dispatch<SetStateAction<BookingState>>,
  isCheckIn: boolean
}) {

  const handleClickButton = () => {
    if (refDate.current && (refDate.current as HTMLInputElement).showPicker) {
      (refDate.current as HTMLInputElement).showPicker()
    }
  }

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  // const days = [ "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabut" ]

  const valueDate = new Date(value)

  const labelDate = `${valueDate.getUTCDate()} ${months[valueDate.getUTCMonth()]} ${valueDate.getFullYear()}`

  // value untuk input (tahun-bulan-tanggal) (2026-01-13)

  return <button className="flex items-center gap-1.5 bg-background p-2 border-2 border-(--status-refund) rounded-lg cursor-pointer relative"
    onClick={handleClickButton}
  >
    <BookingIcons
      name={iconName}
      className="w-5 h-5 text-(--status-refund)"
    />
    <span className="text-sm font-bold opacity-80">{labelDate}</span>
    <input className="absolute top-0 left-0 -z-10" type="date" id="check_in"
      ref={refDate}
      value={valueDate.toISOString().split("T")[0]}
      onChange={(e) => setValue(prev => {
        return {
          ...prev,
          ...{
            [isCheckIn ? "checkIn" : "checkOut"]: new Date(e.target.value).getTime(),
          }
        }
      })}
    />
  </button>
}

function ButtonSelectTotalGuest({
  value,
  setValue,
  showInput,
  setShowInput,
}: {
  value: TotalGuests,
  setValue: Dispatch<SetStateAction<BookingState>>,
  showInput: boolean,
  setShowInput: Dispatch<SetStateAction<ShowInputGuestAndRoom>>
}) {
  return <div className="w-max h-max relative">
    <button className="flex items-center gap-1.5 bg-background p-2 border-2 border-(--status-refund) rounded-lg cursor-pointer relative"
      onClick={() => setShowInput((prev) => {
        return {
          ...prev,
          ...{
            guest: !showInput
          }
        }
      })}
    >
      <BookingIcons
        name="adult"
        className="w-5 h-5 text-(--status-refund)"
      />
      <span
        className="text-sm font-bold opacity-80"
      >{value.adults} Dewasa, {value.childrens} Anak - Anak</span>
    </button>

    <div className={`w-full min-h-3 p-2 ${showInput ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-12 left-0 z-10`}>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="adults" className="text-sm">Dewasa</label>
        <div className="flex justify-center items-center gap-2.5">
          <div className="p-1 h-7 flex justify-center items-center rounded-lg border-2 border-(--status-refund)">
            <BookingIcons
              name="adult"
              className="w-4 h-4 text-(--status-refund)"
            />
          </div>
          <input type="number" min={1}
            className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="adults"
            placeholder="Masukkan Total Orang Dewasa"
            aria-describedby="Masukkan total orang dewasa, adults, tamu"
            onChange={(e) => setValue(prev => {
              return {
                ...prev,
                ...{
                  guests: {
                    adults: Number(e.target.value) ? Number(e.target.value) : 1,
                    childrens: value.childrens
                  }
                }
              }
            })}
            value={value.adults}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="childrens" className="text-sm">Anak - Anak</label>
        <div className="flex justify-center items-center gap-2.5">
          <div className="p-1 h-7 flex justify-center items-center rounded-lg border-2 border-(--status-refund)">
            <BookingIcons
              name="adult"
              className="w-4 h-4 text-(--status-refund)"
            />
          </div>
          <input type="number" min={1}
            className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="childrens"
            placeholder="Masukkan Total Anak - Anak"
            aria-describedby="Masukkan total Anak - Anak, childrens, tamu"
            onChange={(e) => setValue(prev => {
              return {
                ...prev, ...{
                  guests: {
                    childrens: Number(e.target.value),
                    adults: value.adults
                  }
                }
              }
            })}
            value={value.childrens}
          />
        </div>
      </div>

    </div>
  </div>
}

function ButtonSelectTotalRooms({
  value,
  setValue,
  showInput,
  setShowInput,
}: {
  value: number,
  setValue: Dispatch<SetStateAction<BookingState>>,
  showInput: boolean,
  setShowInput: Dispatch<SetStateAction<ShowInputGuestAndRoom>>
}) {
  return <div className="w-max h-max relative">
    <button className="min-w-32 flex items-center gap-1.5 bg-background p-2 border-2 border-(--status-refund) rounded-lg cursor-pointer relative"

      onClick={() => setShowInput(prev => {
        return {
          ...prev,
          ...{
            room: !showInput
          }
        }
      })}

    >
      <BookingIcons
        name="room"
        className="w-5 h-5 text-(--status-refund)"
      />
      <span
        className="text-sm font-bold opacity-80"
      >{value} Kamar</span>
    </button>
    <div className={`w-full min-h-3 p-2 ${showInput ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-12 left-0 z-10`}>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rooms" className="text-sm">Total Kamar</label>
        <div className="flex justify-center items-center gap-2.5">
          <div className="p-1 h-7 flex justify-center items-center rounded-lg border-2 border-(--status-refund)">
            <BookingIcons
              name="room"
              className="w-4 h-4 text-(--status-refund)"
            />
          </div>
          <input type="number" min={0}
            className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="rooms"
            placeholder="Masukkan Total Kamar"
            aria-describedby="Masukkan total kamar, rooms, tamu"
            onChange={(e) => setValue(prev => {
              return {
                ...prev,
                ...{
                  totalRooms: Number(e.target.value) ? Number(e.target.value) : 1,
                }
              }
            })}
            value={value}
          />
        </div>
      </div>
    </div>
  </div>
}

