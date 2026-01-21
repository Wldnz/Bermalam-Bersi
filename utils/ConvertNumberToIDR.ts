export default function convertNumberIntoIDR(price: number) {
    return new Intl.NumberFormat(
        'id-ID',
        {
            style: "currency",
            currency: "IDR"
        }
    ).format(price)
}