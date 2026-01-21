import convertNumberIntoIDR from "./ConvertNumberToIDR"

export function totalRoomsLabel(total: number) {
    let label = "Kamar Terakhir"
    if (total > 1) label = `${total} Kamar Tersedia`
    return label
}

export function getCurrentPriceLabel(
    defaultPrice: number,
    minimumPrice: number
) {
    if (minimumPrice <= 0) return convertNumberIntoIDR(defaultPrice)
    return convertNumberIntoIDR(minimumPrice)
}
