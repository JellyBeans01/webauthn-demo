import { type PropsWithChildren } from "react";
import Button from "~/components/button";

export default async function Layout({ children }: PropsWithChildren) {
    return (
        <div>
            <h2 className="mb-2 text-2xl">I am a very secure page! 😄</h2>
            {children}
            <Button type="button" variant="destructive" className="mt-5">
                Sign out
            </Button>
        </div>
    );
}
