import { GeistSans } from "geist/font/sans";
import { type PropsWithChildren } from "react";
import { Toaster } from "~/components/ui/sonner";
import TRPCReactProvider from "~/providers/trpc-react-provider";
import "~/styles/globals.css";

export const metadata = {
    title: "WebAuthn Demo",
    description: "Demo site regarding WebAuthn authentication",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="nl" className={`${GeistSans.variable}`}>
            <body>
                <TRPCReactProvider>
                    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#191714] to-[#2234AE] py-10 text-white">
                        {children}
                    </main>
                    <Toaster position="top-right" />
                </TRPCReactProvider>
            </body>
        </html>
    );
}
