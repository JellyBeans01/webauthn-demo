import type { Authenticator } from "@prisma/client";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { type AuthenticationResponseJSON, type RegistrationResponseJSON } from "@simplewebauthn/types";
import chalk from "chalk";
import { type User } from "next-auth";
import { cookies } from "next/headers";
import z from "zod";
import { getWebAuthnProviders } from "~/data/webauthn-providers";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Logger from "~/server/classes/Logger";
import { createAuthenticator, createSession, registerNewUserAndSignIn } from "~/server/db/queries/auth";
import { getAuthenticatorByCredentialId } from "~/server/db/queries/authenticator";
import { getUserById } from "~/server/db/queries/user";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { apiError, apiSuccess } from "~/server/resources/responses";
import { getAuthenticationOptions, getRegistrationOptions } from "~/server/utils/webauthn-options";
import { verifyAuthentication, verifyRegistration } from "~/server/utils/webauthn-verify";
import { verificationScheme } from "~/types";

export const authRouter = createTRPCRouter({
    generateOptions: publicProcedure.input(z.object({ isLogin: z.boolean() })).query(async ({ ctx, input }) => {
        try {
            const { isLogin } = input;
            const { session } = ctx;

            Logger.info(`Generating ${chalk.cyan(isLogin ? "AUTHENTICATION" : "REGISTRATION")} options`);

            const user = session ? await getUserById(session.user.id) : null;
            Logger.info("Registering new device", user ? `for user with id ${chalk.cyan(user.id)}` : "");

            const getOptions = isLogin ? getAuthenticationOptions : getRegistrationOptions;

            const options = await getOptions(user);
            Logger.success(`Generated ${chalk.cyan(isLogin ? "AUTHENTICATION" : "REGISTRATION")} options!`);

            return apiSuccess(options);
        } catch (err) {
            console.log("[ERROR] Failed generating registration options\n", err);
            return apiError("Could not generate registration options");
        }
    }),

    verifyRegistration: publicProcedure.input(verificationScheme).mutation(async ({ input, ctx }) => {
        try {
            Logger.info("Verifying registration");

            const challenge = cookies().get(CHALLENGE_COOKIE)?.value ?? null;
            Logger.info("Found challenge", chalk.cyan(challenge));
            if (!challenge) return apiError("Could not verify the registration!");

            const registration = input as RegistrationResponseJSON;

            const { verified, registrationInfo } = await verifyRegistration(registration, challenge);

            Logger.info("Registration is verified:", verified);

            if (!verified) return apiError("Registration verification has failed!");

            Logger.success("Registration verified!");
            Logger.info(
                "Registration:\n",
                JSON.stringify(
                    registrationInfo,
                    (key, value) => (["credentialPublicKey", "attestationObject"].includes(key) ? "..." : value),
                    2,
                ),
            );

            if (!registrationInfo?.credentialPublicKey || !registration.response.transports) {
                return apiError("Verification was successful, but some data was missing!");
            }

            const webAuthnProviders = await getWebAuthnProviders();
            const webAuthnProvider = webAuthnProviders.get(registrationInfo.aaguid) ?? "Unknown";

            // Prepare a new authenticator
            const authenticator: Omit<Authenticator, "userId"> = {
                credentialID: registrationInfo?.credentialID ?? registration.id,
                credentialPublicKey: isoUint8Array.toHex(registrationInfo.credentialPublicKey),
                counter: registrationInfo.counter,
                transports: registration.response.transports.join(","),
                credentialBackedUp: registrationInfo.credentialBackedUp,
                credentialDeviceType: registrationInfo.credentialDeviceType,
                providerAccountId: webAuthnProvider,
            };

            // When a user is logged in
            if (!!ctx.session) {
                // We only need to add the authenticator to the user.
                // No new session nor a new user needs to be made.
                const newAuthenticator = await createAuthenticator(ctx.session.user.id, authenticator);
                if (!newAuthenticator) return apiError("Could not create a new authenticator!");

                return apiSuccess({ verified: true });
            }

            // Prepare a new user
            const user: User = {
                name: "Anonymous",
                // Other user data
                // ...
            };

            const sessionToken = await registerNewUserAndSignIn(user, authenticator);
            Logger.success("Registered user and created new session!");

            return apiSuccess({ verified: true, sessionToken });
        } catch (err) {
            console.log("[ERROR] Failed verifying the registration\n", err);
            return apiError("Could not verify the registration request");
        }
    }),

    verifyAuthentication: publicProcedure.input(verificationScheme).mutation(async ({ input }) => {
        try {
            Logger.info("Verifying authentication");

            const challenge = cookies().get(CHALLENGE_COOKIE)?.value ?? null;
            Logger.info("Found challenge", chalk.cyan(challenge));
            if (!challenge) return apiError("Could not verify the registration!");

            const authentication = input as AuthenticationResponseJSON;

            Logger.info("Trying to find authenticator with credential id", chalk.cyan(authentication.id));
            const authenticator = await getAuthenticatorByCredentialId(authentication.id);
            if (!authenticator) return apiError("Invalid authenticator!");

            Logger.success("Found authenticator!\n", JSON.stringify(authenticator, null, 2));

            const { verified, authenticationInfo } = await verifyAuthentication(
                authentication,
                authenticator,
                challenge,
            );

            Logger.info("Authentication is verified:", verified);

            if (!verified) return apiError("Authentication verification has failed!");

            Logger.success("Authentication verified!");
            Logger.info("Authentication:\n", JSON.stringify(authenticationInfo, null, 2));

            const { password: _password, ...sessionUser } = authenticator.user;
            const session = await createSession(sessionUser);

            Logger.success("Created new session for user!");

            return apiSuccess({ verified: true, sessionToken: session.sessionToken });
        } catch (err) {
            console.log("[ERROR] Failed verifying the authentication\n", err);
            return apiError("Could not verify the authentication request");
        }
    }),
});
