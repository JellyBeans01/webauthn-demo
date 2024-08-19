import { api } from "~/trpc/server";
import Authenticators from "./_components/authenticators";

export default async function Page() {
    const authenticators = await api.authenticators.getAuthenticators();

    return <Authenticators initialAuthenticators={authenticators} />;
}
