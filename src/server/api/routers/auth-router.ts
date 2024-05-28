import { generateRegistrationOptions } from "@simplewebauthn/server";
import { type PublicKeyCredentialDescriptorFuture } from "@simplewebauthn/types";
import { rpID, rpName } from "~/config/webauthn";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getPasskeysByUserId } from "~/server/db/queries/authenticator";
import { getUserById } from "~/server/db/queries/user";
import { apiError, apiSuccess } from "~/server/resources/responses";

export const authRouter = createTRPCRouter({
    generateRegistrationOptions: publicProcedure.query(async ({ ctx }) => {
        try {
            const { session } = ctx;

            const user = session ? await getUserById(session.user.id) : null;
            // const passKeys = user ? await getPasskeysByUserId(user.id) : [];

            const options = await generateRegistrationOptions({
                rpName,
                rpID,
                userID: user?.id ?? "",
                userName: user?.name ?? "",
                // Don't prompt users for additional information about the authenticator
                // (Recommended for smoother UX)
                attestationType: "none",
                // Prevent users from re-registering existing authenticators
                // excludeCredentials: passKeys.map<PublicKeyCredentialDescriptorFuture>((passkey) => ({
                //     id: passkey.credentialID,
                //     type: "public-key",
                //     // Optional
                //     transports: passkey.transports ?? "",
                // })),
                authenticatorSelection: {
                    // Defaults
                    residentKey: "preferred",
                    userVerification: "preferred",
                    // Optional
                    authenticatorAttachment: "platform",
                },
            });

            // TODO: Remember these options for the user

            return apiSuccess(options);
        } catch (err) {
            console.log("[ERROR] Failed generating registration options\n", err);
            return apiError("Could not generate registration options");
        }
    }),
});
