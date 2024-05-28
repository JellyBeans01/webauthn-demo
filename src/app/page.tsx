import Link from "next/link";
import { auth } from "~/auth";
import Button from "~/components/button";

export default async function Home() {
    const session = await auth();

    return (
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">My super awesome website</h1>
            {session && (
                <Link
                    className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
                    href="/very-secure-page"
                >
                    <div className="text-lg">Navigate to a very secure page :)</div>
                </Link>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                <Button type="button">Sign in using Next-auth</Button>
                <Button type="button">Sign in using custom routes</Button>
            </div>
        </div>
    );
}
