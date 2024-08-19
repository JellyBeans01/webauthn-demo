import { type PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <>
            <h2 className="mb-2 text-2xl">My authenticators</h2>
            {children}
        </>
    );
}
