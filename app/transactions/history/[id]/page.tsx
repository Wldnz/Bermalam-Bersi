"use client"
import ActionIcon from "@/components/Icons/Action";
import Navigation from "@/components/Navigation";
import ShowAlert from "@/components/ShowAlert";
import { useBooking } from "@/context/Booking";
import { useUser } from "@/context/UserContext";
import { AxiosErrorCustom } from "@/models/Models";
import { ShowAlertProps } from "@/models/ShowAlertProps";
import StatusTransactionOrBookingProps from "@/models/StatusTransactionOrBooking";
import Api from "@/utils/Api";
import convertNumberIntoIDR from "@/utils/ConvertNumberToIDR";
import CreateQRCODE from "@/utils/CreateQRCode";
import DownloadQRCodeHandler from "@/utils/DonwloadQRCodeHandler";
import GetLabelDate from "@/utils/GetLabelDate";
import { GetStatusAttribuBooking, GetStatusAttributeTransaction } from "@/utils/GetStatusAtrribute";
import SetShowAlertStateAction from "@/utils/SetShowAlert";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface DetailTransaction {
    transaction: {
        id: number
        total_price: string
        total_rooms: number
        tax_cost: string
        total_adults: number
        total_childrens: number
        check_in_at: string
        check_out_at: string
        category: string
        level: string
        payment_type: string
        payment_link: string
        status: string
        expired_at: string
        created_at: string
        updated_at: string
        has_voucher: boolean
        is_refundable: boolean
    },
    hotel: {
        id: number
        name: string
        email: string
        phone: string
        operational_check_in_at: string
        operational_check_out_at: string
        room: {
            name: string
            free_cancel: boolean,
            how_long_to_cancel: string
            refundable: boolean
        }
    },
    bookings: {
        id: number
        id_type_room: number
        person_name: string
        phone_country_code: string
        phone: string
        hasWhastApp: boolean
        status: string
        note: string
        check_in_at: string
        check_out_at: string
    }[]
    voucher: {
        id: number,
        id_user_voucher: number,
        total_price_reduce: string
    }

}

export default function DetailHistory() {

    const [transaction, setTransaction] = useState<DetailTransaction>()

    const [statusTransaction, setStatusTransaction] = useState<StatusTransactionOrBookingProps | null>(null)

    const [showAlertProps, setShowAlertProps] = useState<ShowAlertProps | undefined>()


    const { id } = useParams()

    const { user } = useUser();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const { data } = await Api().get(`/transactions/${id}`)
                const dataHotel = data.data as DetailTransaction
                setTransaction(dataHotel)
                setStatusTransaction(GetStatusAttributeTransaction(dataHotel.transaction.status))
            } catch {
                setTransaction(undefined)
            }
        }
        if (!statusTransaction) {
            fetchTransactions()
        }
    }, [id, statusTransaction])




    if (!transaction) {
        return <div className="flex">
            <h2 >...please wait....</h2>
        </div>
    }

    const cancelTheTransaction = async () => {
        try {
            const { data } = await Api().post(`/transactions/cancel/${id}`)
            SetShowAlertStateAction({
                title: "Berhasil Membatalkan Transaksi!",
                description: data.message,
                category: "success",
                iShowed: true,
            }, setShowAlertProps)
            setStatusTransaction(null)
        } catch (err) {
            const error = err as AxiosErrorCustom
            SetShowAlertStateAction({
                title: error.status === 500 ? "Telah Terjadi Kesalahan" : "Pemberitahuan",
                description: error.response.data.message,
                category: error.status === 500 ? "error" : "information",
                iShowed: true,
            }, setShowAlertProps)
        } finally {

        }
    }

    return <div className="w-full min-h-dvh flex flex-col font-inter bg-background">
        <Navigation />


        {showAlertProps && showAlertProps.iShowed && <ShowAlert
            showedAlertProps={showAlertProps}
            setShowedAlertProps={setShowAlertProps}
        />}

        <div className="w-full h-10"></div>
        <div className="w-full flex justify-center min-h-dvh p-5">

            <div className="w-200 bg-gray-200 flex p-5 rounded-lg">

                <div className="w-full bg-white rounded-lg p-3">
                    <div className="w-full flex flex-col gap-2.5 border-b-2 border-background">

                        <div className="w-full flex justify-between items-center">
                            <div className="flex flex-col gap-2.5">
                                <h2 className="font-medium text-xl">Ringkasan Pemesanan Hotel</h2>
                                <span className="text-sm">#{transaction.transaction.id}</span>
                            </div>
                            {statusTransaction && <div className={`flex items-center gap-2.5 p-1 px-2 border-2 ${statusTransaction.className} rounded-lg`}>
                                <ActionIcon className="w-6 h-6" name={statusTransaction.iconName} />
                                <span className="font-bold">{statusTransaction.label}</span>
                            </div>}
                        </div>

                        <div className="w-full flex justify-between py-2">
                            <div className="flex flex-col gap-2.5">
                                <div className="flex flex-col gap-1 text-sm">
                                    <span className="">Bayar Sebelum</span>
                                    <div className="flex items-center gap-2.5">
                                        <span className="">{new Date(Number(transaction.transaction.expired_at)).toString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm">
                                    <span className="">Transaksi Dibuat Pada</span>
                                    <div className="flex">
                                        <span className="">{GetLabelDate(new Date(Number(transaction.transaction.created_at)))}</span>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="w-max h-max flex items-center justify-center rounded-lg bg-(--status-refund) text-background">
                                <div className="flex items-center gap-1"> 
                                    <BookingIcons className="w-4 h-4 text-(--status-refund)" name="sun" />
                                    <span className="">Sehari</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookingIcons className="w-4 h-4 text-(--status-refund)" name="moon" />
                                    <span className="">2 Malam</span>
                                </div>
                            </div> */}
                        </div>

                    </div>

                    <div className="w-full flex flex-col gap-2.5 border-b-2 border-background py-2">
                        <div className="w-full flex flex-col gap-2.5">
                            {/* <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Harga Kamar (x)</span>
                                <span className="text-sm">{ convertNumberIntoIDR(Number(transaction.transaction.total_price)) }</span>
                            </div> */}
                            {/* <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Potongan Harga Kamar (x)</span>
                                <span className="text-sm">Rp. 300.000,00</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Total Harga Kamar (x3 Kamar)</span>
                                <span className="text-sm">Rp. 5.700.000,00</span>
                            </div> */}
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Biaya Layanan Aplikasi</span>
                                <span className="text-sm">{convertNumberIntoIDR(Number(transaction.transaction.tax_cost))}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Total Biaya</span>
                                <span className="text-sm">{convertNumberIntoIDR(Number(transaction.transaction.total_price))}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Jenis Pembayaran</span>
                                <span className="text-sm">{transaction.transaction.payment_type ? transaction.transaction.payment_type : "Belum bayar"}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Kategori Pembayaran</span>
                                <span className="text-sm">{transaction.transaction.category}</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-2.5 border-b-2 border-background py-2">
                        <div className="w-full flex flex-col gap-2.5">
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm font-bold">{transaction.hotel.name}</span>
                                <Link
                                    href={`/hotels/${transaction.hotel.id}`}
                                    className="font-bold text-(--status-refund)">Lihat Hotel</Link >
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Tipe Kamar</span>
                                <span className="text-sm">{transaction.hotel.room.name}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Jumlah Kamar</span>
                                <span className="text-sm">x{transaction.transaction.total_rooms} Kamar</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Check-In</span>
                                <span className="text-sm">{GetLabelDate(new Date(Number(transaction.transaction.check_in_at)))}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Check-Out</span>
                                <span className="text-sm">{GetLabelDate(new Date(Number(transaction.transaction.check_out_at)))}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Jumlah Tamu</span>
                                <span className="text-sm">{transaction.transaction.total_adults} Dewasa, {transaction.transaction.total_childrens} Anak - Anak</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-2.5 border-b-2 border-background py-2">
                        <div className="w-full flex flex-col gap-2.5">
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm font-bold">Data Yang Bertanggung Jawab Pada Pemesanan</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Nama Lengkap</span>
                                <span className="text-sm">{user ? user.first_name + user.last_name : ""}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Alamat Email</span>
                                <span className="text-sm">{user?.email}</span>
                            </div>
                            {/* <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Nomor Telepon</span>
                                <span className="text-sm">{ user? user. : "" }</span>
                            </div> */}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {transaction.transaction.status == "pending" && <>
                            <Link className="w-full bg-(--status-refund) text-background font-bold p-3 rounded-lg cursor-pointer text-center"
                                href={transaction.transaction.payment_link}
                            >
                                Bayar Sekarang
                            </Link>
                            <button className="w-full border-2 border-(--status-refund) text-(--status-refund) bg-background font-bold p-3 rounded-lg cursor-pointer text-center"
                                onClick={() => SetShowAlertStateAction({
                                    title: "Apakah anda yakin ingin membatalkan pemesanan ini?",
                                    description: "Pemesanan akan langsung dibatalkan, dan anda bisa membuatnya kembali nanti!",
                                    category: "information",
                                    actions: [
                                        {
                                            label: "Ya, Batalkan Transaksi",
                                            handler: cancelTheTransaction
                                        }
                                    ],
                                    closeAction: {
                                        label: "Tidak, Tutup Pemberitahuan",
                                        handler: () => { }
                                    },
                                    iShowed: true,
                                }, setShowAlertProps)}
                            >
                                Batalkan Transaksi
                            </button>
                        </>}
                        {transaction.transaction.status == "paid" && <>
                            <div className="w-full flex items-center gap-2.5">
                                <button className="w-full bg-(--status-refund) text-background font-bold p-3 rounded-lg cursor-pointer text-center">
                                    Download Dokumen Pembayaran
                                </button>
                                {/* <Link className="w-full bg-(--status-refund) text-background font-bold p-3 rounded-lg cursor-pointer text-center"
                                    href={"#booking-sectio"}
                                >
                                    Lihat QR CODE
                                </Link> */}
                            </div>
                            <button className="w-full border-2 border-(--status-refund) text-(--status-refund) bg-background font-bold p-3 rounded-lg cursor-pointer text-center">
                                Buat Permintaan Pembatalan Transaksi
                            </button>
                        </>}
                    </div>
                </div>

            </div>
        </div>


        <div className="w-full h-20"></div>
        {transaction.transaction.status == "paid" ? <div className="w-full flex gap-2.5 overflow-x-scroll p-5"
            id="booking-sectio"
        >
            {transaction.bookings.map((booking, index) => {
                const statusBookingAttribute = GetStatusAttribuBooking(booking.status)
                return <div className="flex flex-col rounded-lg bg-white p-5" key={`booking-${booking.id}-${index}`}>

                    <div className="min-w-100 flex flex-col gap-2.5 border-b-2 border-background">
                        <div className="flex flex-col gap-2">
                            <h2 className="font-bold text-xl">Detail Kamar Hotel #{index + 1}</h2>
                            <div className={`w-max flex items-center gap-2.5 rounded-lg border-2 ${statusBookingAttribute.className} p-1.5`}>
                                <ActionIcon className="w-5 h-5" name={statusBookingAttribute.iconName} />
                                <span className="font-bold text-sm">{statusBookingAttribute.label}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5 py-2 border-b-2 border-background">
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Nama Hotel</span>
                                <span className="text-sm">{transaction.hotel.name}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Check - In</span>
                                <span className="text-sm">{GetLabelDate(new Date(Number(booking.check_in_at)))}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Check - Out</span>
                                <span className="text-sm">{GetLabelDate(new Date(Number(booking.check_out_at)))}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Permintaan Tambahan</span>
                                <button className="text-sm text-(--status-refund) cursor-pointer"
                                    onClick={() => SetShowAlertStateAction({
                                        title: "Permitan Tambahan",
                                        description: booking.note ? booking.note : `${booking.person_name} Tidak Memiliki Permintaan Tambahan`,
                                        category: "information",
                                        actions: [],
                                        iShowed: true,
                                    }, setShowAlertProps)}
                                >Lihat Permintaan Tambahan</button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5 py-2 border-b-2 border-background">
                            <h2 className="font-bold text-xl">Data Tamu Yang Berkunjung</h2>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Nama Penerima</span>
                                <span className="text-sm">{booking.person_name}</span>
                            </div>
                            <div className="w-full flex justify-between items-center">
                                <span className="text-sm">Nomor Telepon</span>
                                <span className="text-sm">+{booking.phone_country_code + booking.phone}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 py-2 border-b-2 border-background"
                            id={`booking-${booking.id}-${index}`}
                        >
                            <div className="flex flex-col items-center gap-2.5">
                                <div className="w-max flex justify-center items-center bg-(--status-refund) p-2 rounded-lg">
                                    <ActionIcon className="w-5 h-5 text-background" name="scan" />
                                </div>
                            </div>
                            <div className="flex flex-col text-center">
                                <h2 className="font-medium text-xl">SCAN QR CODE</h2>
                                <span className="text-sm">Tunjukkan QR Code Ini Untuk Administrasi</span>
                            </div>
                            <CreateQRCODE text={booking.id.toString()} />
                            <button className="w-full bg-(--status-refund) text-background font-medium p-2 rounded-lg cursor-pointer"
                                onClick={() => DownloadQRCodeHandler(`booking-${booking.id}-${index}`, booking.person_name + "-booking-id-" + booking.id)}
                            >Download QR CODE</button>
                        </div>

                    </div>

                </div>
            })}
        </div> : <></>}
    </div>

}