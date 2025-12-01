import { AppSidebar } from "@/components/appsidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full">
                    <SidebarTrigger />
                    <div className="p-6 w-full relative">
                        {children}
                    </div>
                </main>
            </SidebarProvider>
        </>
    )
}
