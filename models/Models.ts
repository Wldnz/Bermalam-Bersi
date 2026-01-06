

export interface AuthSession{
    id:number
    first_name:string
    role:string
    verified:number
    status:string
    is_authorize:boolean
}

export interface IconProps {
    name: string
    className: string
}