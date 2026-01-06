import CallApi from "@/utils/CallApi";
import Image from "next/image";
import { AuthSession } from "@/models/Models";

export default function ProfileNavigationSide({
    user
} : {
    user : AuthSession
}) {
    return (
        <div className="w-full h-max flex justify-between items-center">
            <div className="flex items-center gap-2.5">
                <Image
                    className="rounded-full"
                    src={"/images/default-profile.jpg"}
                    width={40}
                    height={40}
                    alt="photo-profile"
                />
                <div className="flex flex-col items-start">
                    <h2 className="font-bold text-foreground text-sm">{user.first_name}</h2>
                    {/* <div className={`flex items-center gap-1 ${user.verified? "bg-(--status-done)" : "bg-(--status-reject)"} p-1 rounded-sm`}>
                        <Image
                            className="rounded-full"
                            src={`/icons/${user.verified ? 'ic_success_outline' : 'ic_close_outline'}.svg`}
                            width={12}
                            height={12}
                            alt="icon-verified"
                        />
                        <span className="text-[10px] font-bold text-background">{user.verified? "Terverifikasi" : "Belum Terverifikasi"}</span>
                    </div> */}
                    <span className="text-[9px] font-bold text-background bg-(--b1) p-1 px-2 rounded-sm ">{user.role}</span>
                </div>
            </div>
            <Image
                className="cursor-pointer"
                src={"/icons/ic_signin.svg"}
                width={20}
                height={20}
                alt="photo-profile"
                onClick={handleLogout}
            />
        </div>
    )
}

function handleLogout() {

    if (confirm("Anda yakin ingin keluar?")) {
        const api = CallApi();

        api.get("/logout")
            .then(resp => {
                if (resp.status === 200) {
                    window.location.href = "/signin"
                }
            })
            .catch(err => {
                console.log(err)
            })

    }

}