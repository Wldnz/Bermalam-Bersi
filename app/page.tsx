"use client"
import BookingIcons from "@/components/Icons/Booking";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import { Dispatch, RefObject, SetStateAction, useRef, useState } from "react";


interface TotalGuests {
  adults: number
  childrens: number
}

interface ShowInputGuestAndRoom {
  guest: boolean
  room: boolean
}

export default function Home() {
  const checkInRef = useRef(null)
  const checkOutRef = useRef(null)

  const currentTimeMili = new Date().getTime()
  const [checkInDate, setCheckInDate] = useState<number>(currentTimeMili)
  const [checkOutDate, setCheckOutDate] = useState<number>((60 * 60 * 24 * 1000) + currentTimeMili) // the next day
  
  const [showInputGuestAndRoom, setShowInputGuestAndRoom] = useState<ShowInputGuestAndRoom>({
    guest: false,
    room: false,
  })

  const [totalRooms, setTotalRooms] = useState<number>(1)

  const [totalGuests, setTotalGuests] = useState<TotalGuests>({
    adults: 1,
    childrens: 1,
  })

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

                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="text-bold text-background">Sehari</span>
                    <BookingIcons
                      name="sun"
                      className="w-4 h-4 text-(--status-wait)"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="text-bold text-background">2 Malam</span>
                    <BookingIcons
                      name="moon"
                      className="w-4 h-4 text-(--status-wait)"
                    />
                  </div>

                </div>

                <div className="flex gap-2.5 p-2">
                  <ButtonSelectDate iconName="check_in" refDate={checkInRef} setValue={setCheckInDate} value={checkInDate} />
                  <ButtonSelectDate iconName="check_out" refDate={checkOutRef} setValue={setCheckOutDate} value={checkOutDate} />
                  <ButtonSelectTotalGuest setTotalGuests={setTotalGuests} totalGuests={totalGuests} setShowInput={setShowInputGuestAndRoom} showInput={showInputGuestAndRoom.guest} />
                  <ButtonSelectTotalRooms setTotalRooms={setTotalRooms} totalRooms={totalRooms} setShowInput={setShowInputGuestAndRoom} showInput={showInputGuestAndRoom.room}  />
                </div>
              </div>
              <div className="w-full p-3 flex items-center gap-2.5 rounded-2xl rounded-tl-none bg-background">
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
                />
              </div>

            </div>

            <div className="">
              <h4>Riwayat Pencarian</h4>
              <div className="flex flex-wrap">

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
}: {
  iconName: string,
  refDate: RefObject<null>,
  value: number,
  setValue: Dispatch<SetStateAction<number>>,
}) {

  const handleClickButton = () => {
    if (refDate.current && (refDate.current as HTMLInputElement).showPicker) {
      (refDate.current as HTMLInputElement).showPicker()
    }
  }

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  // const days = [ "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabut" ]

  const valueDate = new Date(value)

  const initiliazeDate = `${valueDate.getFullYear()}-${valueDate.getMonth() + 1}-${valueDate.getUTCDate()}`
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
      value={initiliazeDate}
      onChange={(e) => setValue(new Date(e.target.value).getTime())}
    />
  </button>
}

function ButtonSelectTotalGuest({
  totalGuests,
  setTotalGuests,
  showInput,
  setShowInput,
}: {
  totalGuests: TotalGuests,
  setTotalGuests: Dispatch<SetStateAction<TotalGuests>>,
  showInput: boolean,
  setShowInput: Dispatch<SetStateAction<ShowInputGuestAndRoom>>
}) {
  return <div className="w-max h-max relative">
    <button className="flex items-center gap-1.5 bg-background p-2 border-2 border-(--status-refund) rounded-lg cursor-pointer relative"
      onClick={(e) => setShowInput((prev) => {
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
      >{totalGuests.adults} Dewasa, {totalGuests.childrens} Anak - Anak</span>
    </button>

    <div className={`w-full min-h-3 p-2 ${showInput ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-12 left-0`}>

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
            onChange={(e) => setTotalGuests(prev => {
              return {
                ...prev, ...{
                  adults: Number(e.target.value)
                }
              }
            })}
            value={totalGuests.adults}
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
            onChange={(e) => setTotalGuests(prev => {
              return {
                ...prev, ...{
                  childrens: Number(e.target.value)
                }
              }
            })}
            value={totalGuests.childrens}
          />
        </div>
      </div>

    </div>
  </div>
}

function ButtonSelectTotalRooms({
  totalRooms,
  setTotalRooms,
  showInput,
  setShowInput,
}: {
  totalRooms: number,
  setTotalRooms: Dispatch<SetStateAction<number>>,
  showInput: boolean,
  setShowInput: Dispatch<SetStateAction<ShowInputGuestAndRoom>>
}) {
  return <div className="w-max h-max relative">
    <button className="min-w-32 flex items-center gap-1.5 bg-background p-2 border-2 border-(--status-refund) rounded-lg cursor-pointer relative"
      
      onClick={() => setShowInput(prev => {
        return {
          ...prev,
          ...{
            room : !showInput
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
      >{totalRooms} Kamar</span>
    </button>
    <div className={`w-full min-h-3 p-2 ${showInput ? "flex" : "hidden"} flex-col gap-2.5 bg-background border-2 border-(--status-refund) rounded-lg absolute top-12 left-0`}>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="rooms" className="text-sm">Total Kamar</label>
        <div className="flex justify-center items-center gap-2.5">
          <div className="p-1 h-7 flex justify-center items-center rounded-lg border-2 border-(--status-refund)">
            <BookingIcons
              name="room"
              className="w-4 h-4 text-(--status-refund)"
            />
          </div>
          <input type="number" min={1}
            className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="rooms"
            placeholder="Masukkan Total Kamar"
            aria-describedby="Masukkan total kamar, rooms, tamu"
            onChange={(e) => setTotalRooms(Number(e.target.value))}
            value={totalRooms}
          />
        </div>
      </div>
    </div>
  </div>
}

