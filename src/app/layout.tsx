import type { Metadata } from "next";
import "./global.css"
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
    title: "Oxid Gateway Console",
    description: "Manage your oxid gateway configuration",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                    <Toaster/>
                </ThemeProvider>
            </body>
        </html>
    );
}
