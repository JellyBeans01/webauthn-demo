import { type PropsWithChildren } from "react";
import { signOut } from "~/auth";
import Button from "~/components/buttons/button";

export default async function Layout({ children }: PropsWithChildren) {
    return (
        <div className="container">
            <h2 className="mb-2 text-2xl">I am a very secure page! 😄</h2>
            {children}
            <form
                action={async () => {
                    "use server";
                    await signOut();
                }}
            >
                <Button type="submit" variant="destructive" className="mt-5">
                    Sign out
                </Button>
            </form>
        </div>
    );
}
