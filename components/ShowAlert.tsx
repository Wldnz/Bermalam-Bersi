"use client"
import React, { Dispatch, SetStateAction, useState } from "react"
import ActionIcon from "./Icons/Action"
import { ShowAlertProps } from "@/models/ShowAlertProps"
import SetShowAlertStateAction from "@/utils/SetShowAlert"


export default function ShowAlert({ showedAlertProps, setShowedAlertProps, children }: {
    showedAlertProps: ShowAlertProps,
    setShowedAlertProps: Dispatch<SetStateAction<ShowAlertProps | undefined>>,
    children? : React.ReactNode
}) {

    const { title, category, description, actions, closeAction, AdditionalInformation } = showedAlertProps

    const [showAlert, setShowAlert] = useState<boolean>(true)

    return showAlert ? <div className="w-full h-dvh flex items-center justify-center fixed top-0 left-0 z-30">
        <div className="w-full h-dvh bg-foreground opacity-80 absolute top-0 left-0 -z-10"></div>
        <div className="min-w-150 flex flex-col items-center gap-2.5 border-4  min-h-20 bg-white rounded-xl p-5">
            <GettingAlertIcon category={category} />
            <div className="flex flex-col items-center gap-1">
                <h2 className="font-bold text-xl">{title}</h2>
                <span className="text-sm">{description}</span>
            </div>

            { AdditionalInformation && AdditionalInformation?.map((information, index) => {
                return <AdditionalInformationCard isSucces={information.isSuccess} label={information.label} key={`key-additional-information-${information.label}-${index}`} />
            } ) }

            { children }

            <div className="w-full flex flex-col gap-1.5">
                {actions && actions?.map((action, index) => {
                    return <TombolHitam label={action.label}
                        handler={action.handler}
                        setShowAlert={setShowAlert}
                        setShowedAlertProps={setShowedAlertProps!}
                        key={`action-button-${index}-${action.label}`}
                    />
                })}
            </div>
            <TombolTutup label={closeAction?.label ?? "Tutup Pemberitahuan"} handler={closeAction?.handler ?? function () { }} setShowAlert={setShowAlert} setShowedAlertProps={setShowedAlertProps!} />
        </div>
    </div> : <></>
}

const GettingAlertIcon = ({ category }: { category: string }) => {

    const alertIcons = [
        {
            name: "success",
            iconName: "success_outline",
            class: "text-(--status-done)"
        },
        {
            name: "information",
            iconName: "information",
            class: "text-(--status-refund)"
        },
        {
            name: "error",
            iconName: "close_outline",
            class: "text-(--status-reject)"
        },
    ]

    const Icon = alertIcons.find(icon => icon.name === category)

    return <ActionIcon className={`w-14 h-14 ${Icon?.class ?? "text-(--status-done)"}`} name={Icon?.iconName ?? "information_solid"} />
}

const AdditionalInformationCard = ({
    label, isSucces
} : {
    label : string,
    isSucces : boolean
}) => {
    return <div className={`w-full flex items-center justify-between ${isSucces ? "text-(--status-done)" : "text-(--status-reject)"}`}>
        <span className="font-bold">{ label }</span>
        <div className="flex items-center gap-1.5">
            <span className="font-medium">{ isSucces? "Berhasil" : "Tidak Berhasil" }</span>
            <ActionIcon className="w-5 h-5" name={isSucces ? "success" : "close_outline"} />
        </div>
    </div>
}

const TombolHitam = ({
    label,
    handler,
    setShowAlert,
    setShowedAlertProps
}: {
    label: string,
    handler: () => void,
    setShowAlert: Dispatch<SetStateAction<boolean>>,
    setShowedAlertProps: Dispatch<SetStateAction<ShowAlertProps | undefined>>,
}) => {
    return <button className="w-full p-3 font-bold text-background bg-foreground rounded-lg cursor-pointer"
        type="button"
        onClick={() => {
            setShowAlert(false);
            SetShowAlertStateAction({
                title: "",
                description: "",
                category: "",
                AdditionalInformation : [],
                actions : [],
                iShowed: false
            }, setShowedAlertProps)
            handler();
        }}
    > {label} </button>
}

const TombolTutup = ({
    label,
    handler,
    setShowAlert,
    setShowedAlertProps,
}: {
    label: string,
    handler: () => void,
    setShowAlert: Dispatch<SetStateAction<boolean>>,
    setShowedAlertProps: Dispatch<SetStateAction<ShowAlertProps | undefined>>,
}) => {
    return <button className="w-full p-3 font-bold text-foreground) bg-background rounded-lg cursor-pointer"
        type="button"
        onClick={() => {
            setShowAlert(false);
            SetShowAlertStateAction({
                title: "",
                description: "",
                category: "",
                AdditionalInformation : [],
                actions : [],
                iShowed: false
            }, setShowedAlertProps)
            handler()
        }}
    >{label}</button>
}