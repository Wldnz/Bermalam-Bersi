import NavigationSide from "@/components/NavigationSide"
import NavigationTop from "@/components/NavigationTop"

export default function AuthorizedLayout({
    children,
} : {
    children: React.ReactNode
})
{
    return(
        <main className="w-full flex bg-background">
            <NavigationSide />
            <aside className="w-full flex flex-col">
                <NavigationTop/>
                <div className="w-full flex flex-col gap-5 p-2.5">
                    {children}
                </div>
            </aside>
        </main>
    )
}