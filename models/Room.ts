export interface TypeRoom {
    id: number
    name: string
    description: string
    max_adults: number
    max_childrens: number
    room_size: number
    bed_type: string
    refundable: boolean
    free_cancel: boolean
    how_long_to_cancel: number
    default_price: string
    minimum_price: string
    total_rooms: number
    image_url: string
}
export interface OrderRoom {
    room: TypeRoom
    quantity: number
    checkIn: number
    checkOut: number
}