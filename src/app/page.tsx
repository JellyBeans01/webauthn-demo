import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth } from "~/auth";
import ManualButton from "~/components/buttons/custom-routes/manual-button";
import NextAuthButton from "~/components/buttons/next-auth/next-auth-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default async function Home() {
    const session = await auth();

    return (
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem] text-center">
                My super awesome website
            </h1>
            {!!session ? (
                <Link
                    className="flex flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                    href="/very-secure-page"
                >
                    <div className="text-lg flex flex-row justify-between items-center gap-4">
                        <span className="flex-1">Navigate to a very secure page :)</span>
                        <ArrowRight />
                    </div>
                </Link>
            ) : (
                <Tabs defaultValue="custom-routes">
                    <TabsList className="w-full">
                        <TabsTrigger value="custom-routes">Custom routes</TabsTrigger>
                        <TabsTrigger value="next-auth">Next-Auth</TabsTrigger>
                    </TabsList>
                    <TabsContent value="custom-routes" className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-8">
                        <ManualButton>Register using custom routes</ManualButton>
                        <ManualButton isLogin>Sign in using custom routes</ManualButton>
                    </TabsContent>
                    <TabsContent value="next-auth" className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-8">
                        <NextAuthButton>Register using next-auth</NextAuthButton>
                        <NextAuthButton isLogin>Sign in using Next-auth</NextAuthButton>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
