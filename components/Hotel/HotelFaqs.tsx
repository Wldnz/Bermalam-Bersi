import { Faqs } from "@/models/Faqs"
import ActionIcon from "../Icons/Action"

export default function HotelFaqs({
    faqs
} : {
    faqs : Faqs[]
}) {

    return faqs?.length && <div className="flex flex-col gap-4" id="faqs">
            <h2 className="font-bold text-xl">Pertanyaan - Pertanyaan Yang Sering Diajukan</h2>
            <div className="flex flex-col gap-4">
                {faqs.map((faq, index) => {
                    return <details className="group cursor-pointer" key={`${faq.id + index} + ${faq.answer}`}>
                        <summary className="p-3 flex justify-between items-center bg-(--status-refund) text-background rounded-lg outline-none group-open:rounded-b-none">
                            <span className="text-lg font-bold">{faq.question}</span>
                            <div>
                                <ActionIcon className="w-7 h-7 text-background group-open:hidden" name="positive" />
                                <ActionIcon className="w-7 h-7 text-background hidden group-open:block" name="negative" />
                            </div>
                        </summary>
                        <p className="p-4 bg-background group-open:rounded-b-lg">{faq.answer}</p>
                    </details>
                })}
            </div>
        </div>

}