import { Dispatch, SetStateAction } from "react"

export interface ShowAlertProps {
    title: string
    category: string
    description: string
    actions?: ActionButtonProps[]
    closeAction?: CloseActionButtonProps
    iShowed? : boolean
    setShowedAlertProps? : Dispatch<SetStateAction<ShowAlertProps | undefined>>
}

export interface ActionButtonProps {
    label: string
    handler: () => void
    showButton?: boolean
}

interface CloseActionButtonProps {
    label: string
    handler?: () => void
}