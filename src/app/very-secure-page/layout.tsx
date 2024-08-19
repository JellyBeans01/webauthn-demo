import { LogOut, PlusCircle } from "lucide-react";
import { type PropsWithChildren } from "react";
import { signOut } from "~/auth";
import Button from "~/components/buttons/button";
import ManualButton from "~/components/buttons/custom-routes/manual-button";

export default async function Layout({ children }: PropsWithChildren) {
    return (
        <div className="container">
            <h2 className="mb-2 text-2xl">I am a very secure page! 😄</h2>
            {children}
            <div className="flex gap-2 mt-5">
                <ManualButton variant="default">
                    <PlusCircle className="size-4 mr-2" />
                    Add another authenticator
                </ManualButton>
                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/" });
                    }}
                >
                    <Button type="submit" variant="destructive">
                        <LogOut className="size-4 mr-2" />
                        Sign out
                    </Button>
                </form>
            </div>
        </div>
    );
}
