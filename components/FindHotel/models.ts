export interface SearchHistoryLocation {
  location: string
  isLocation: boolean
}

export interface TotalGuests {
  adults: number
  childrens: number
}

export interface ShowInputGuestAndRoom {
  guest: boolean
  room: boolean
}

export interface BookingState {
  checkIn: number
  checkOut: number
  totalRooms: number
  guests: TotalGuests
  category: string
  search: string
}

export interface RecomendationTextResponse {
  id: number
  hotel_id: number
  label: string
  city: string
  province: string
}



export interface RecomendationText {

  locations: {
    province: string
    cities: string[]
  }[]

  hotels: {
    id: number,
    label: string
  }[]

}