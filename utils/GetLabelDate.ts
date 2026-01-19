export default function GetLabelDate(date: Date) {
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    // const days = [ "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabut" ]
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getFullYear()}`
  }