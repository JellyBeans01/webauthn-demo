import type { Authenticator } from "@prisma/client";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import { type AuthenticationResponseJSON, type RegistrationResponseJSON } from "@simplewebauthn/types";
import { type User } from "next-auth";
import { cookies } from "next/headers";
import z from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createSession, registerNewUserAndSignIn } from "~/server/db/queries/auth";
import { getAuthenticatorByCredentialId } from "~/server/db/queries/authenticator";
import { getUserById } from "~/server/db/queries/user";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { apiError, apiSuccess } from "~/server/resources/responses";
import { getAuthenticationOptions, getRegistrationOptions } from "~/server/utils/webauthn-options";
import { verifyAuthentication, verifyRegistration } from "~/server/utils/webauthn-verify";

export const verificationScheme = z.object({
    id: z.string(),
    type: z.string(),
    authenticatorAttachment: z.enum(["cross-platform", "platform"]).optional(),
    rawId: z.string(),
    response: z.any(),
    clientExtensionResults: z.any(),
});

export const authRouter = createTRPCRouter({
    generateOptions: publicProcedure.input(z.object({ isLogin: z.boolean() })).query(async ({ ctx, input }) => {
        try {
            const { isLogin } = input;
            const { session } = ctx;

            const user = session ? await getUserById(session.user.id) : null;

            const getOptions = isLogin ? getAuthenticationOptions : getRegistrationOptions;

            const options = await getOptions(user);

            return apiSuccess(options);
        } catch (err) {
            console.log("[ERROR] Failed generating registration options\n", err);
            return apiError("Could not generate registration options");
        }
    }),

    verifyRegistration: publicProcedure.input(verificationScheme).mutation(async ({ input }) => {
        try {
            const challenge = cookies().get(CHALLENGE_COOKIE)?.value ?? null;
            if (!challenge) return apiError("Could not verify the registration!");

            const registration = input as RegistrationResponseJSON;

            const { verified, registrationInfo } = await verifyRegistration(registration, challenge);

            if (!verified) return apiError("Registration verification has failed!");

            if (!registrationInfo?.credentialPublicKey || !registration.response.transports) {
                return apiError("Verification was successful, but some data was missing!");
            }

            const user: User = {
                name: "Anonymous",
                // Other user data
            };

            const authenticator: Omit<Authenticator, "userId"> = {
                credentialID: registrationInfo?.credentialID ?? registration.id,
                credentialPublicKey: isoUint8Array.toHex(registrationInfo.credentialPublicKey),
                counter: registrationInfo.counter,
                transports: registration.response.transports.join(","),
                credentialBackedUp: registrationInfo.credentialBackedUp,
                credentialDeviceType: registrationInfo.credentialDeviceType,
                providerAccountId: "WebAuthn",
            };

            const sessionToken = await registerNewUserAndSignIn(user, authenticator);

            return apiSuccess({ verified: true, sessionToken });
        } catch (err) {
            console.log("[ERROR] Failed verifying the registration\n", err);
            return apiError("Could not verify the registration request");
        }
    }),

    verifyAuthentication: publicProcedure.input(verificationScheme).mutation(async ({ input }) => {
        try {
            const challenge = cookies().get(CHALLENGE_COOKIE)?.value ?? null;
            if (!challenge) return apiError("Could not verify the registration!");

            const authentication = input as AuthenticationResponseJSON;

            const authenticator = await getAuthenticatorByCredentialId(authentication.id);
            if (!authenticator) return apiError("Invalid authenticator!");

            // TODO: Do we need to do smth with authenticationInfo data?
            const { verified, authenticationInfo: _authenticationInfo } = await verifyAuthentication(
                authentication,
                authenticator,
                challenge,
            );

            if (!verified) return apiError("Authentication verification has failed!");

            const { password: _password, ...sessionUser } = authenticator.user;
            const session = await createSession(sessionUser);

            return apiSuccess({ verified: true, sessionToken: session.sessionToken });
        } catch (err) {
            console.log("[ERROR] Failed verifying the authentication\n", err);
            return apiError("Could not verify the authentication request");
        }
    }),
});
