"use client"
import BookingIcons from "@/components/Icons/Booking";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import { useRef } from "react";




export default function Home() {
  const checkInInput = useRef(null)
  // const checkOutInput = useRef(null)

  function handleClick(){

    if (checkInInput.current && (checkInInput.current as HTMLInputElement).showPicker){
      (checkInInput.current as HTMLInputElement).showPicker()
    }

  }

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

                <div className="flex p-2">
                  <button className="flex items-center gap-1.5 bg-background p-2 border-2 border-(--status-refund) rounded-lg cursor-pointer relative"
                   onClick={() => handleClick()}
                  >
                    <BookingIcons
                      name="check_in"
                      className="w-5 h-5 text-(--status-refund)"
                    />
                    <span
                      className="text-sm font-bold opacity-60"
                    >21 November 2025</span>
                    <input className="absolute top-0 left-0 -z-10" type="date" id="check_in"
                    ref={checkInInput}
                    />
                  </button>
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
