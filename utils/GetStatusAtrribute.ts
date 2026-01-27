import StatusTransactionOrBookingProps from "@/models/StatusTransactionOrBooking"

export function GetStatusAttributeTransaction(status: string) : StatusTransactionOrBookingProps {

    const attributes = [
        {
            iconName: "success",
            label: "Menunggu Pembayaran",
            className: "text-(--status-wait) border-(--status-wait)",
            status: "pending"
        },
        {
            iconName: "success_outline",
            label: "Berhasil",
            className: "text-(--status-done) border-(--status-done)",
            status: [
                "success",
                "paid"
            ]
        },
        {
            iconName: "success",
            label: "Permintaan Pengembalian Dana",
            className: "text-(--status-refund) border-(--status-refund)",
            status: "request_refund"
        },
        {
            iconName: "close_outline",
            label: "Gagal",
            className: "text-(--status-reject) border-(--status-reject)",
            status: [
                "cancelled",
                "failed"
            ]
        }
    ]

    const attribute = attributes.find(atr => {
        if (typeof atr.status === "object") {
            const statusArr = atr.status as string[]
            const isFound = statusArr.find(s => s == status)
            if (isFound) return atr
        } else {
            if (atr.status === status) {
                return atr
            }
        }
    })

    return attribute ?? attributes[0]

}

export function GetStatusAttribuBooking(status: string) : StatusTransactionOrBookingProps {

    const attributes = [
        {
            iconName: "success",
            label: "Menunggu Tamu",
            className: "text-(--status-wait) border-(--status-wait)",
            status: "pending"
        },
        {
            iconName: "check_in",
            label: "Tamu Sedang Menempati",
            className: "text-(--status-done) border-(--status-done)",
            status: "check_in"
        },
        {
            iconName: "check_out",
            label: "Tamu Telah Keluar",
            className: "text-(--status-done) border-(--status-done)",
            status: "check_out"
        },
        {
            iconName: "success",
            label: "Dana Dikembalikan Sepenuhnya",
            className: "text-(--status-refund) border-(--status-refund)",
            status: "refund_all"
        },
        {
            iconName: "success",
            label: "Dana Down Payment Dikembalikan",
            className: "text-(--status-refund) border-(--status-refund)",
            status: "refund_half"
        }
    ]

    const attribute = attributes.find(atr => {
        if (typeof atr.status === "object") {
            const statusArr = atr.status as string[]
            const isFound = statusArr.find(s => s == status)
            if (isFound) return atr
        } else {
            if (atr.status === status) {
                return atr
            }
        }
    })

    return attribute ?? attributes[0]

}