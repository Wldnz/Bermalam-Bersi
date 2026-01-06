import axios from "axios"

function CallApi() {
    const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_HOST_NAME,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        }
    })
    return api
}

export default CallApi;