import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";
import { API_PATH } from "~/config/trpc";
import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling an HTTP request (e.g., when you make requests from Client Components).
 */
const createContext = async (req: NextRequest) => {
    return createTRPCContext({
        headers: req.headers,
    });
};

const handler = (req: NextRequest) => {
    const onError = ({ path, error }: { path: string | undefined; error: { message: string } }) => {
        console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
    };

    return fetchRequestHandler({
        endpoint: API_PATH,
        req,
        router: appRouter,
        createContext: () => createContext(req),
        onError: env.NODE_ENV === "development" ? onError : undefined,
    });
};

export { handler as GET, handler as POST };
