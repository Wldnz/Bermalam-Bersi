import { Dispatch, SetStateAction } from "react"
import { SearchHistoryLocation } from "./models"
import ActionIcon from "../Icons/Action"

export default function HistorySearch({
    value,
    setValue
} : {
    value : SearchHistoryLocation[] | [],
    setValue : Dispatch<SetStateAction<SearchHistoryLocation[] | []>>
}){
    return <div className="w-full flex flex-col gap-3 mt-10">
                <h4 className="font-bold text-background">Riwayat Pencarian</h4>
                <div className="flex flex-wrap gap-2.5">

                  {value.map((location, index) => {
                    if (location.isLocation) {
                      return <SearchHistoryButton setValue={setValue} value={location} key={`Key-${location.isLocation}-${index}`} />
                    }
                  })}

                </div>
              </div>

}

function SearchHistoryButton(
  {
    value,
    setValue
  }
    : {
      value: SearchHistoryLocation,
      setValue: Dispatch<SetStateAction<SearchHistoryLocation[] | []>>
    }) {
  return <div
    className="flex justify-between items-center min-w-60 bg-background p-2 px-3 border-2 border-(--status-refund) rounded-xl"
  >
    <button
      className="w-full text-start"
      onClick={() => console.log('insert search...')}
    >
      {value.location}
    </button>
    <button
      className="cursor-pointer"
      type="button"
      title="close-history-search"
      onClick={() => setValue(prev => prev.filter(location => location.location != value.location))}
    >
      <ActionIcon
        className="w-5 h-5 "
        name="close_tight"
      />
    </button>
  </div>

}