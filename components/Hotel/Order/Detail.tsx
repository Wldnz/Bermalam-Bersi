// "use client" 
// import ActionIcon from "@/components/Icons/Action";
// import BookingIcons from "@/components/Icons/Booking";
// import HotelIcons from "@/components/Icons/Hotel";
// import { useBooking } from "@/context/Booking";
// import { OrderRoom } from "@/models/Room";
// import { getCurrentPriceLabel, totalRoomsLabel } from "@/utils/HotelPrice";
// import Image from "next/image";
// import { useRouter } from "next/router"
// import { useEffect, useState } from "react";

// export default function DetailOrders() {

//     const { orders :  defaultOrders } = useBooking()

//     const router = useRouter();

//     const [orders, setOrders] = useState<OrderRoom[] | []>([])

//     useEffect(() => {
        
//     }, [defaultOrders])

//     return <div className="w-full h-dvh p-3 flex justify-center items-center fixed top-0 left-0">
//             <div className="w-full min-h-20 max-h-[90%] overflow-y-scroll border-2 border-(--status-refund) bg-white rounded-lg relative">
//                 <div className="flex justify-between items-center p-4 border-b-2 border-(--status-refund)">
//                     <h2 className="font-bold text-xl">Ringkasan Pemesanan Hotel</h2>
//                     <div className="flex gap-2.5 items-center">
//                         <div className="flex justify-between items-center gap-4 bg-(--status-refund) rounded-lg p-2">
//                             {/* {totalNights - 1 ? <div className="flex items-center gap-0.5">
//                                 <span className="text-xs font-bold text-background">{totalNights - 1 ? `${totalNights - 1} Hari` : "Sehari"}</span>
//                                 <BookingIcons className="w-4 h-4 text-(--b4)" name="sun" />
//                             </div> : <></>}
//                             <div className="flex items-center gap-0.5">
//                                 <span className="text-xs font-bold text-background">{totalNights ? `${totalNights} Malam` : "Semalam"}</span>
//                                 <BookingIcons className="w-4 h-4 text-(--status-wait)" name="moon" />
//                             </div> */}
//                         </div>
//                         <button className="cursor-pointer"
//                             // onClick={() => setShowPopUp(prev => {
//                             //     return {
//                             //         ...prev,
//                             //         ...{
//                             //             orders: false
//                             //         }
//                             //     }
//                             // })}
//                         >
//                             <ActionIcon className="w-7 h-7 text-(--status-refund)" name="close_tight" />
//                         </button>
//                     </div>
//                 </div>
//                 <div className="flex flex-col gap-4 p-5">
//                     <h2 className="font-bold text-lg">Wah, Kamu Sudah Memesan 3 Unit Kamar Dari 2 Tipe Kamar</h2>
//                     <div className="max-h-full flex flex-col gap-2.5">
//                         {/* hotel-card-summary-order */}
//                         {orders.map(({ room, quantity }, index) => {
//                             return <div className="flex gap-2.5" key={`order-${index}`}>
//                                 <Image
//                                     className="rounded-lg"
//                                     width={300}
//                                     height={200}
//                                     src={room.image_url}
//                                     alt={`${room.name}-order`}
//                                 />
//                                 <div className="w-full flex justify-between">
//                                     <div className="flex flex-col gap-2.5">
//                                         <h4 className="font-medium text-lg">{room.name}</h4>
//                                         <div className="grid grid-cols-2 gap-2">
//                                             <div className="flex items-center gap-1">
//                                                 <BookingIcons className="w-6 h-6" name="adult" />
//                                                 <span className="text-sm">{room.max_adults} Tamu</span>
//                                             </div>
//                                             <div className="flex items-center gap-1">
//                                                 <HotelIcons className="w-6 h-6" name="room-size" />
//                                                 <span className="text-sm">{room.room_size} M^2</span>
//                                             </div>
//                                             <div className="flex items-center gap-1">
//                                                 {/* selain twin, single bed maka akan masuk ke kategori special bed */}
//                                                 <HotelIcons className="w-6 h-6" name={room.bed_type} />
//                                                 <span className="text-sm">Single Bed</span>
//                                             </div>
//                                         </div>
//                                         <div className="flex flex-col gap-3">
//                                             <div className="flex items-center gap-2">
//                                                 <ActionIcon className="w-5 h-5" name="success" />
//                                                 <span className="">{room.free_cancel ? "yes" : "noe"}</span>
//                                             </div>
//                                             <div className="flex items-center gap-2">
//                                                 <ActionIcon className="w-5 h-5" name="success" />
//                                                 <span className="">Televesion</span>
//                                             </div>
//                                             <div className="flex items-center gap-2">
//                                                 <ActionIcon className="w-5 h-5" name="success" />
//                                                 <span className="">Televesion</span>
//                                             </div>
//                                             <div className="flex items-center gap-2">
//                                                 <ActionIcon className="w-5 h-5" name="success" />
//                                                 <span className="">Televesion</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <div className="flex flex-col justify-between items-end">
//                                         <span className="text-(--status-refund)">{totalRoomsLabel(room.total_rooms)}</span>
//                                         <div className="flex flex-col items-end gap-2.5">
//                                             <span className="text-(--status-refund)">{quantity}x Kamar</span>
//                                             {/* <span className="line-through">{convertNumberIntoIDR(Number(room.default_price))}/Malam</span> */}
//                                             <span className="text-(--status-refund) text-lg font-bold">{getCurrentPriceLabel(Number(room.default_price), Number(room.minimum_price))}/Malam</span>
//                                             <div className="flex items-center gap-2.5">
//                                                 <button className="flex justify-center items-center p-1 bg-(--status-refund) rounded-lg cursor-pointer"
//                                                     onClick={() => {
//                                                         const newOrders = orders.map(r => {
//                                                             if (r.room.id == room.id) {
//                                                                 const qty = r.quantity + 1
//                                                                 if (qty > Number(room.total_rooms)) {
//                                                                     alert(`Kamu tidak bisa memesan kamar lebih besar dari ${room.total_rooms}`)
//                                                                 } else {
//                                                                     r.quantity = qty
//                                                                 }
//                                                             }
//                                                             return r
//                                                         })
//                                                         setOrders(newOrders as OrderRoom[])
//                                                         const countTotalRooms = newOrders.reduce((acc, currentValue) => {
//                                                             return acc + currentValue.quantity
//                                                         }, 0)
//                                                         setBookingDate(prev => {
//                                                             return {
//                                                                 ...prev,
//                                                                 ...{
//                                                                     totalRooms: countTotalRooms
//                                                                 }
//                                                             }
//                                                         })
//                                                     }}
//                                                 >
//                                                     <ActionIcon className="w-6 h-6 text-background" name="arrow-up" />
//                                                 </button>
//                                                 <input
//                                                     className="w-10 p-1 text-center font-bold text-(--status-refund) border-2 border-(--status-refund) outline-none rounded-lg"
//                                                     type="number"
//                                                     inputMode="numeric"
//                                                     minLength={1}
//                                                     maxLength={2}
//                                                     value={quantity}
//                                                     onChange={(e) => {
//                                                         try {
//                                                             const qty = Number(e.target.value) ?? 1
//                                                             const newOrders = orders.map(r => {
//                                                                 if (r.room.id == room.id) {
//                                                                     if (qty <= 0) {
//                                                                         return null
//                                                                     } else {
//                                                                         r.quantity = qty
//                                                                     }
//                                                                 }
//                                                                 return r
//                                                             }).filter(r => r)
//                                                             setOrders(newOrders as OrderRoom[])
//                                                             const countTotalRooms = (newOrders as OrderRoom[]).reduce((acc, currentValue) => {
//                                                                 return acc + currentValue.quantity
//                                                             }, 0)
//                                                             setBookingDate(prev => {
//                                                                 return {
//                                                                     ...prev,
//                                                                     ...{
//                                                                         totalRooms: countTotalRooms
//                                                                     }
//                                                                 }
//                                                             })
//                                                         } catch {
//                                                             setOrders(prev => prev)
//                                                         }
//                                                     }}
//                                                 />
//                                                 <button className="flex justify-center items-center p-1 bg-(--status-refund) rounded-lg cursor-pointer"
//                                                     onClick={() => {
//                                                         const newOrders = orders.map(r => {
//                                                             if (r.room.id == room.id) {
//                                                                 const qty = r.quantity - 1
//                                                                 if (qty <= 0) {
//                                                                     return null
//                                                                 } else {
//                                                                     r.quantity = qty
//                                                                 }
//                                                             }
//                                                             return r
//                                                         }).filter(r => r)
//                                                         setOrders(newOrders as OrderRoom[])
//                                                     }}
//                                                 >
//                                                     <ActionIcon className="w-6 h-6 text-background" name="arrow-down" />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                             </div>
//                         })}
//                     </div>
//                 </div>
//                 <div className="w-full p-4 bg-background flex justify-between items-end sticky bottom-0 left-0">
//                     <div className="flex flex-col justify-end gap-1">
//                         <span className="text-(--status-refund)">{orders.reduce((acc, cur) => {
//                             return acc + cur.quantity
//                         }, 0)}x Kamar</span>
//                         {/* <span className="text-sm line-through">{convertNumberIntoIDR(orders.reduce((acc, cur) => {
//                                     return acc + Number(cur.room.default_price) * cur.quantity
//                                 }, 0))}</span> */}
//                         <span className="text-lg font-bold text-(--status-refund)">{
//                             getCurrentPriceLabel(orders.reduce((acc, cur) => {
//                                 return acc + Number(cur.room.default_price) * cur.quantity * totalNights
//                             }, 0), orders.reduce((acc, cur) => {
//                                 return acc + Number(cur.room.minimum_price) * cur.quantity * totalNights
//                             }, 0))
//                         }/ Malam</span>
//                         <div className="flex items-center gap-1">
//                             <ActionIcon className="w-6 h-6 text-(--status-refund)" name="information" />
//                             <span className="text-sm">Belum Termasuk Pajak Dan Biaya Tambahan</span>
//                         </div>
//                     </div>
//                     <button className="h-15 p-3 text-background font-bold bg-(--status-refund) rounded-sm cursor-pointer"
//                         onClick={() => {
//                             bookingContext.saveBooking(bookingDate)
//                             bookingContext.saveOrders(orders)
//                             router.push("/transactions/create")
//                         }}
//                     >Pesan Sekarang</button>
//                 </div>
//             </div>
//         </div> 
// }