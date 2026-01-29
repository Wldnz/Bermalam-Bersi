export interface ShowAlertProps {
    title: string
    category: string
    description: string
    actions?: ActionButtonProps[]
    closeAction?: CloseActionButtonProps
    AdditionalInformation?: {
        label : string
        isSuccess : boolean
    }[]
    iShowed? : boolean
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