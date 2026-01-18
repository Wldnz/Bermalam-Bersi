import Image from "next/image"

export default function RecommendationPopulerDestination() {
    return <div className="flex flex-col gap-10  p-5 mt-10">
        <div className="flex flex-col justify-center items-center text-foreground">
            <h2 className="font-bold text-3xl text-(--status-refund)">Mau Liburan Tapi Gak Tau Mau Kemana?</h2>
            <p className="text-xl">Tenang Aja, Kami sudah membuatkan rekomendasi yang mungkin cocok untuk kamu kunjungi ya!</p>
        </div>

        <div className="flex flex-col gap-5">
            <h2 className="text-xl font-bold">DESTINASI POPULER PADA BALI</h2>

            <div className="flex gap-3.5">
                <PopulerDestinationCard />
            </div>

        </div>
    </div>
}

function PopulerDestinationCard() {

    const populerDestination = [
        {
            name: "Pantai Kuta",
            description: "Pantai kut adalah tempat wisata yng cocok untuk kamu yang ingin surfing dan lain lain-lainya",
            location: "Pantai Barat",
            image_url: "/images/populer_destination/pantai_kuta.jpg"
        },
        {
            name: "Pantai Kuta",
            description: "Pantai kut adalah tempat wisata yng cocok untuk kamu yang ingin surfing dan lain lain-lainya",
            location: "Pantai Barat",
            image_url: "/images/populer_destination/pantai_kuta.jpg"
        },
        {
            name: "Tanah Lot",
            description: "Tanah Lot adalah tempat wisata yng cocok untuk kamu yang ingin surfing dan lain lain-lainya yang cihuy banget...",
            location: "Pantai Barat",
            image_url: "/images/populer_destination/tanah_lot_bali.jpg"
        },
        {
            name: "Tanjung Benoa",
            description: "Tanjung benoa adalah pusat watersport yangs seru pada bali, dengan ombak yang tenang, tempat ini cocok untuk berbagai aktivitas air yang menantang adrenalin dan sangat cocok untuk pemula.",
            location: "Pantai Barat",
            image_url: "/images/populer_destination/tanjung_benoa.webp"
        },
        {
            name: "Ubud",
            description: "Mau lihat kera liar di habitat aslinya? Ubud Monkey Forest ini adalah tempatnya!",
            location: "Pantai Timur",
            image_url: "/images/populer_destination/ubud.webp"
        },
        {
            name: "Taman Nasional Bali Barat",
            description: "Taman Nasional Bali Barat adalah tempat yang sangat amat cocok untuk kamu kunjungi!",
            location: "Pantai Timur",
            image_url: "/images/populer_destination/taman_nasional_barat.webp"
        }

    ]


    return populerDestination.map((destination, index) => {
        return <div className="group w-60 h-100 hover:w-180 relative"
            key={`destination-index-${index}`}>
            <Image
                className="w-full h-full "
                width={400}
                height={10}
                src={destination.image_url}
                alt={`destination-image-${destination.name}`}
            />
            <div className="w-full h-full bg-foreground opacity-60 absolute top-0 left-0"></div>
            <div className="flex flex-col gap-2.5 text-background absolute bottom-3 left-3">
                <h2 className="font-bold text-2xl text-background group-hover:text-(--status-wait)">{destination.name}</h2>
                <div className="hidden flex-col gap-2.5 group-hover:flex">
                    <p className="text-lg">{destination.description}</p>
                    <button className="w-max text-lg font-bold border-2 border-background p-2.5 rounded-lg cursor-pointer outline-none"
                    >Lihat Tempat Bermalam Disekitar</button>
                </div>
            </div>
        </div>
    })
}