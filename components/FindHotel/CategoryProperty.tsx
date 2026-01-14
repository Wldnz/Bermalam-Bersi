import { Dispatch, SetStateAction } from "react"
import { BookingState } from "./models"
import HotelCategoryIcon from "../Icons/CategoryHotel"

export default function CategoryProperty({
    value,
    setValue,
}: {
    value: BookingState,
    setValue: Dispatch<SetStateAction<BookingState>>
}) {
    return <div className="flex gap-2.5 p-3">
        <ButtonCategoryProperty currentCategory={value.category} iconName="" label="Semuanya" name="all" setValue={setValue} />
        <ButtonCategoryProperty currentCategory={value.category} iconName="hotel" label="Hotel" name="hotel" setValue={setValue} />
        <ButtonCategoryProperty currentCategory={value.category} iconName="villa" label="Villa" name="villa" setValue={setValue} />
        <ButtonCategoryProperty currentCategory={value.category} iconName="apartment" label="Apartemen" name="apartment" setValue={setValue} />
    </div>
}

function ButtonCategoryProperty({
    iconName,
    name,
    label,
    currentCategory,
    setValue,
}: {
    iconName: string,
    name: string,
    label: string,
    currentCategory: string,
    setValue: Dispatch<SetStateAction<BookingState>>,
}) {

    const isCurrentCategory = currentCategory == name

    return <button
        className={`flex items-center gap-1.5 p-2 px-4 ${isCurrentCategory ? "font-bold bg-(--status-refund) text-background" : "bg-background text-(--status-refund)"} rounded-xl cursor-pointer`}
        onClick={() => setValue(prev => {
            return {
                ...prev,
                ...{
                    category: name
                }
            }
        })}
    >
        {iconName == "" ? <></> : <HotelCategoryIcon className={`w-6 h-6 ${isCurrentCategory ? "text-background" : "text-(--status-refund)"}`} name={iconName} />}
        <span>{label}</span>
    </button>

}

