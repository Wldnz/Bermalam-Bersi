import { Dispatch, RefObject, SetStateAction } from "react"
import BookingIcons from "../Icons/Booking"
import { BookingState, ShowInputGuestAndRoom } from "./models"
import GetLabelDate from "@/utils/GetLabelDate"

export default function BookingDate({
  checkInRef,
  checkOutRef,
  value,
  setValue,
  showInput,
  setShowInput
}: {
  checkInRef: RefObject<null>,
  checkOutRef: RefObject<null>,
  value: BookingState,
  setValue: Dispatch<SetStateAction<BookingState>>,
  showInput: ShowInputGuestAndRoom,
  setShowInput: Dispatch<SetStateAction<ShowInputGuestAndRoom>>
}) {

  return <div className="flex gap-2.5 p-2">
    <ButtonSelectDate iconName="check_in" refDate={checkInRef} setValue={setValue} value={value} isCheckIn={true} />
    <ButtonSelectDate iconName="check_out" refDate={checkOutRef} setValue={setValue} value={value} isCheckIn={false} />
    <ButtonSelectTotalGuest setValue={setValue} value={value} setShowInput={setShowInput} showInput={showInput.guest} />
    <ButtonSelectTotalRooms setValue={setValue} value={value} setShowInput={setShowInput} showInput={showInput.room} />
  </div>

}

function ButtonSelectDate({
  iconName,
  refDate,
  value,
  setValue,
  isCheckIn,
}: {
  iconName: string,
  refDate: RefObject<null>,
  value: BookingState,
  setValue: Dispatch<SetStateAction<BookingState>>,
  isCheckIn: boolean
}) {

  const handleClickButton = () => {
    if (refDate.current && (refDate.current as HTMLInputElement).showPicker) {
      (refDate.current as HTMLInputElement).showPicker()
    }
  }

  const valueDate = new Date(value[isCheckIn ? "checkIn" : "checkOut"])

  const labelDate = GetLabelDate(valueDate)

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
      onChange={(e) => {
        const currentTime = new Date().getTime()
        const currentValue = new Date(e.target.value).getTime()
        if (isCheckIn && currentValue < currentTime) return alert('Eits... Kamu Tidak Bisa Check-In Di Kemaren Kemaren Hari ya!')
        if (isCheckIn && currentValue >= value.checkOut) return alert('Pastikan waktu check-in di bawah waktu check-out!')
        if (!isCheckIn && currentValue > ((60 * 60 * 24 * 365 * 1000) + currentTime)) return alert('Eits.... Kamu Tidak Memesan Kamar Lebih Dari Setahun!')
        if (!isCheckIn && currentValue < value.checkIn) return alert('Eits.... Kamu Tidak Bisa Memilih Check-Out Dibawah Check-In!')
        setValue(prev => {
          return {
            ...prev,
            ...{
              [isCheckIn ? "checkIn" : "checkOut"]: new Date(e.target.value).getTime(),
            }
          }
        })
      }}
    />
  </button>
}

function ButtonSelectTotalGuest({
  value,
  setValue,
  showInput,
  setShowInput,
}: {
  value: BookingState,
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
            guest: !showInput,
            room: false,
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
      >{value.guests.adults} Dewasa, {value.guests.childrens} Anak - Anak</span>
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

function ButtonSelectTotalRooms({
  value,
  setValue,
  showInput,
  setShowInput,
}: {
  value: BookingState,
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
            room: !showInput,
            guest: false,
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
      >{value.totalRooms} Kamar</span>
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
          <input type="number" min={1}
            className="w-full h-7 p-0.5 px-1 border-2 border-(--status-refund) rounded-lg outline-none" id="rooms"
            placeholder="Masukkan Total Kamar"
            aria-describedby="Masukkan total kamar, rooms, tamu"
            onChange={(e) => {
              const total = Number(e.target.value)
              if (total > 8) return alert('Untuk saat ini, kami membatasi untuk setiap tamu hanya bisa memesan 8 kamar')
              if (total > value.guests.adults) return alert(`Eits... Kamu Memesan ${total} Kamar Dan Orang Dewasa Harus Ada ${total}`)
              setValue(prev => {
                return {
                  ...prev,
                  ...{
                    totalRooms: total ? total : 1,
                  }
                }
              }
              )
            }}
            value={value.totalRooms}
          />
        </div>
      </div>
    </div>
  </div>
}

