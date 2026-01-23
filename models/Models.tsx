export interface IconProps {
    name: string
    className: string
}

export interface FAQS {
  question: string
  answer: string
}

export interface AxiosErrorCustom{
    status : number
    response : {
        data : {
            message : string
            error : string
            status_code : number
        }
    }
}