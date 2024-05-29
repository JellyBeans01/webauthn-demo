import { generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import { type AuthenticationResponseJSON } from "@simplewebauthn/types";
import { cookies } from "next/headers";
import z from "zod";
import { rpID, origin } from "~/config/webauthn";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { apiError, apiSuccess } from "~/server/resources/responses";

export const verificationScheme = z.object({
    id: z.string(),
    type: z.string(),
    authenticatorAttachment: z.enum(["cross-platform", "platform"]).optional(),
    rawId: z.string(),
    response: z.any(),
    clientExtensionResults: z.any(),
});

export const authenticationRouter = createTRPCRouter({
    generateAuthenticationOptions: publicProcedure.query(async ({ ctx }) => {
        try {
            // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/registration/generateRegistrationOptions.ts
            const options = await generateAuthenticationOptions({
                rpID,
            });

            console.log(options);

            return apiSuccess(options);
        } catch (err) {
            console.log("[ERROR] Failed generating registration options\n", err);
            return apiError("Could not generate registration options");
        }
    }),

    verifyAuthentication: publicProcedure.input(verificationScheme).mutation(async ({ input }) => {
        try {
            const challenge = cookies().get(CHALLENGE_COOKIE)?.value ?? null;
            if (!challenge) return apiError("Could not verify the registration!");

            const authentication = input as AuthenticationResponseJSON;

            // TODO: Get authenticator info from the registration

            // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/verifyAuthenticationResponse.ts
            const { verified, authenticationInfo } = await verifyAuthenticationResponse({
                response: authentication,
                authenticator: {
                    credentialID: "",
                    counter: 0,
                    credentialPublicKey: "",
                    transports: "",
                },
                expectedChallenge: challenge,
                expectedOrigin: `${origin}${env.NODE_ENV === "development" ? ":3000" : ""}`,
                expectedRPID: rpID,
            });

            if (!verified) return apiError("Registration verification has failed!");

            console.log({ authenticationInfo });

            // const user = await db.user.create({data: { name:  }})
            // TODO:
            //  1. create a new user
            //  2. store authenticator
            //  3. create session

            console.log({ verified });

            return apiSuccess({ verified: true });
        } catch (err) {
            console.log("[ERROR] Failed verifying the registration\n", err);
            return apiError("Could not verify the registration");
        }
    }),
});
