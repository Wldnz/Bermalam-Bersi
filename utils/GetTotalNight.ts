export default function GetTotalNights(
    checkIn : number,
    checkOut : number
) {
    const oneDayMili = 60 * 60 * 24 * 1000
    return Math.round((checkOut - checkIn) / oneDayMili);
}