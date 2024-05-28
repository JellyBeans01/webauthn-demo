import { generateRegistrationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoUint8Array, isoBase64URL } from "@simplewebauthn/server/helpers";
import {
    type AuthenticationResponseJSON,
    type AuthenticatorTransportFuture,
    type PublicKeyCredentialDescriptorFuture,
} from "@simplewebauthn/types";
import { cookies } from "next/headers";
import z from "zod";
import { rpID, rpName, origin } from "~/config/webauthn";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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

export const authRouter = createTRPCRouter({
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
                    authenticatorAttachment: "platform",
                    requireResidentKey: true,
                },
                supportedAlgorithmIDs: [-7, -257],
            });

            // TODO: Remember these options for the user

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

            const registration = input as AuthenticationResponseJSON;

            console.log(registration);

            // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/verifyAuthenticationResponse.ts
            const { verified, authenticationInfo } = await verifyAuthenticationResponse({
                response: registration,
                expectedChallenge: challenge, // Challenge we stored in the cookies
                expectedOrigin: `${origin}${env.NODE_ENV === "development" ? ":3000" : ""}`,
                expectedRPID: rpID,
                requireUserVerification: false,
            });

            if (!verified) return apiError("Registration verification has failed!");

            // TODO:
            //  1. create a new user
            //  2. store authenticator
            //  3. create session

            return apiSuccess({ verified: true });
        } catch (err) {
            console.log("[ERROR] Failed verifying the registration\n", err);
            return apiError("Could not verify the registration");
        }
    }),
});
