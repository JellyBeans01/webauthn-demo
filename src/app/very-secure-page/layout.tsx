import { LogOut } from "lucide-react";
import { signOut } from "~/auth";
import Button from "~/components/buttons/button";
import { type ParallelPageProps } from "~/types";

export default async function Layout({ children, authenticators }: ParallelPageProps<["authenticators"]>) {
    return (
        <div className="container">
            <div className="mb-2 flex flex-row items-center justify-between">
                <h2 className="text-2xl">I am a very secure page! 😄</h2>
                <form
                    className="mt-5"
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                    }}
                >
                    <Button type="submit" variant="destructive">
                        <LogOut className="mr-2 size-4" />
                        Sign out
                    </Button>
                </form>
            </div>
            {children}
            <div className="mt-5">{authenticators}</div>
        </div>
    );
}
