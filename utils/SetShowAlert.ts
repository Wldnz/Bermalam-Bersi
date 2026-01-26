import { ShowAlertProps } from "@/models/ShowAlertProps"
import { Dispatch, SetStateAction } from "react"

export default function SetShowAlertStateAction(
    { title, description, category, actions, closeAction, iShowed }: ShowAlertProps,
    setShowAlertProps: Dispatch<SetStateAction<ShowAlertProps | undefined>>
) {
    setShowAlertProps({
        title,
        description,
        category,
        actions,
        closeAction,
        iShowed
    })
}