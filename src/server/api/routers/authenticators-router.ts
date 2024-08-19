import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import Logger from "~/server/classes/Logger";
import { getAuthenticatorsByUserId } from "~/server/db/queries/authenticator";

export const authenticatorsRouter = createTRPCRouter({
    getAuthenticators: protectedProcedure.query(async ({ ctx }) => {
        try {
            Logger.info("Fetching authenticators");

            const authenticators = await getAuthenticatorsByUserId(ctx.session.user.id);
            Logger.success("Found", authenticators.length, "authenticators");

            return authenticators;
        } catch (err) {
            Logger.error("Failed fetching authenticators", err);
            return [];
        }
    }),
});
