import { ReadonlyURLSearchParams } from "next/navigation";

export default function GetRedirectURLParams( params : ReadonlyURLSearchParams ){
    return params.get("redirect_url") ?? "/"
}