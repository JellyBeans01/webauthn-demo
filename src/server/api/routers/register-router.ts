import type { Authenticator } from "@prisma/client";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoUint8Array, isoBase64URL } from "@simplewebauthn/server/helpers";
import {
    type AuthenticatorTransportFuture,
    type PublicKeyCredentialDescriptorFuture,
    type RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { type User } from "next-auth";
import { cookies } from "next/headers";
import z from "zod";
import { rpID, rpName, origin } from "~/config/webauthn";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { registerNewUserAndSignIn } from "~/server/db/queries/auth";
import { getPasskeysByUserId } from "~/server/db/queries/authenticator";
import { getUserById } from "~/server/db/queries/user";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { apiError, apiSuccess } from "~/server/resources/responses";
import { generateRandomString } from "~/utils/text";

export const verificationScheme = z.object({
    id: z.string(),
    type: z.string(),
    authenticatorAttachment: z.enum(["cross-platform", "platform"]).optional(),
    rawId: z.string(),
    response: z.any(),
    clientExtensionResults: z.any(),
});

export const registerRouter = createTRPCRouter({
    generateRegistrationOptions: publicProcedure.query(async ({ ctx }) => {
        try {
            const { session } = ctx;

            const user = session ? await getUserById(session.user.id) : null;
            const passKeys = user ? await getPasskeysByUserId(user.id) : [];

            // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/registration/generateRegistrationOptions.ts
            const options = await generateRegistrationOptions({
                rpName,
                rpID,
                userID: isoUint8Array.fromUTF8String(user?.id ?? generateRandomString()),
                userName: user?.name ?? "Anonymous",
                // Don't prompt users for additional information about the authenticator
                // (Recommended for smoother UX)
                attestationType: "none",
                // Prevent users from re-registering existing authenticators
                excludeCredentials: passKeys.map<PublicKeyCredentialDescriptorFuture>((passkey) => ({
                    id: isoBase64URL.toBuffer(passkey.credentialID),
                    type: "public-key",
                    transports: (passkey.transports?.split(",") ?? []) as AuthenticatorTransportFuture[],
                })),
                authenticatorSelection: {
                    authenticatorAttachment: "cross-platform",
                },
                supportedAlgorithmIDs: [-7, -257],
            });

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

            // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/verifyAuthenticationResponse.ts
            const { verified, registrationInfo } = await verifyRegistrationResponse({
                response: registration,
                expectedChallenge: challenge, // Challenge we stored in the cookies
                expectedOrigin: `${origin}${env.NODE_ENV === "development" ? ":3000" : ""}`,
                expectedRPID: rpID,
                requireUserVerification: false,
            });

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
                providerAccountId: "webauthn",
            };

            const sessionToken = await registerNewUserAndSignIn(user, authenticator);

            return apiSuccess({ verified: true, sessionToken });
        } catch (err) {
            console.log("[ERROR] Failed verifying the registration\n", err);
            return apiError("Could not verify the registration");
        }
    }),
});
