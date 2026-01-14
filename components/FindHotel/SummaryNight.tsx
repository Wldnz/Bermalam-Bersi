import BookingIcons from "../Icons/Booking"

export default function SummaryNights({
  totalNight
}: {
  totalNight: number
}) {
  return <div className="h-7 flex items-center self-end gap-4 self bg-(--status-refund) p-2 rounded-lg rounded-b-none">
    {
      totalNight <= 1 ? <></> : <div className="flex items-center justify-center gap-1 text-sm">
        <span className="text-bold text-background">{
          (totalNight - 1) + " Hari"
        }</span>
        <BookingIcons
          name="sun"
          className="w-4 h-4 text-(--status-wait)"
        />
      </div>
    }
    <div className="flex items-center justify-center gap-1 text-sm">
      <span className="text-bold text-background">{
        totalNight <= 1 ? "Semalam" : totalNight + " Malam"
      }</span>
      <BookingIcons
        name="moon"
        className="w-4 h-4 text-(--status-wait)"
      />
    </div>
  </div>
}