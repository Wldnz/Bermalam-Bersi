import { useQRCode } from "next-qrcode"
export default function CreateQRCODE({
    text
}: {
    text: string
}) {
    const { Canvas } = useQRCode();
    return (
        <Canvas
            text={text}
            options={{
                errorCorrectionLevel: 'M',
                type : "image/webp",
                margin: 3,
                scale: 4,
                width: 200,
                color: {
                    dark: '#000000',  // HITAM (untuk modul/kotak QR)
                    light: '#FFFFFF', // PUTIH (untuk background)
                },
            }}
        />
    )
}