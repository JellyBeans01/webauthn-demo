import chalk from "chalk";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import Logger from "~/server/classes/Logger";
import { getAuthenticatorsByUserId, removeAuthenticatorByCredentialId } from "~/server/db/queries/authenticator";

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

    removeAuthenticator: protectedProcedure.input(z.string()).mutation(async ({ input: credentialId, ctx }) => {
        try {
            Logger.info("Removing authenticator with credentialID", chalk.cyan(credentialId));

            const authenticators = await getAuthenticatorsByUserId(ctx.session.user.id);
            if (authenticators.length === 1) return { success: false }; // prevent removing the last authenticator

            const removedAuthenticator = await removeAuthenticatorByCredentialId(credentialId, ctx.session.user.id);
            return { success: !!removedAuthenticator };
        } catch (err) {
            Logger.error("Failed removing authenticator", err);
            return { success: false };
        }
    }),
});
