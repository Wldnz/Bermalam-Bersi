import { AuthSession } from "@/models/Models";
import CallApi from "@/utils/CallApi"

export default async function GetCurrentSession() : Promise<AuthSession>{
    const api = CallApi();

    const resp = await api.get("/check-current-session")

    if(resp.status === 200){
       return {
        ...resp.data.data,
        is_authorize : true
       } as AuthSession
    // resp.status == 403 || resp.status === 404
    }else{
        return {
            is_authorize : false
        } as AuthSession
    }
}

// function _saveSession(data : AuthSession){
//     currentSession = data
// }

// export function GetCurrentSession() : AuthSession{
    
//     if(!currentSession.first_name){
//         _getNewSession()
//     }

//     console.log(currentSession.first_name)

//    return currentSession;

// }