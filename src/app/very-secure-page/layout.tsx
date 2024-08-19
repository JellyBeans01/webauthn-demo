import { LogOut, PlusCircle } from "lucide-react";
import { type PropsWithChildren, Suspense } from "react";
import Authenticators from "~/app/very-secure-page/components/authenticators/authenticators";
import AuthenticatorsLoading from "~/app/very-secure-page/components/authenticators/authenticators-loading";
import { signOut } from "~/auth";
import Button from "~/components/buttons/button";
import ManualButton from "~/components/buttons/custom-routes/manual-button";

export default async function Layout({ children }: PropsWithChildren) {
    return (
        <div className="container">
            <h2 className="mb-2 text-2xl">I am a very secure page! 😄</h2>
            {children}
            <div className="mt-5">
                <h2 className="mb-2 text-2xl">My authenticators</h2>
                <Suspense fallback={<AuthenticatorsLoading />}>
                    <Authenticators />
                </Suspense>
            </div>
            <div className="mt-5 flex gap-2">
                <ManualButton variant="default">
                    <PlusCircle className="mr-2 size-4" />
                    Add another authenticator
                </ManualButton>
                <form
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
        </div>
    );
}
