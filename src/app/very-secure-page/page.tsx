import { auth } from "~/auth";

export default async function Page() {
    const session = await auth();

    return (
        <pre className="rounded-xl bg-white/10 p-4 break-all whitespace-pre-wrap">
            {JSON.stringify(session, null, 2)}
        </pre>
    );
}
