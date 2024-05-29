import { generateAuthenticationOptions, generateRegistrationOptions } from "@simplewebauthn/server";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import type { AuthenticatorTransportFuture, PublicKeyCredentialDescriptorFuture } from "@simplewebauthn/types";
import { type User } from "next-auth";
import { rpID, rpName } from "~/config/webauthn";
import { getPasskeysByUserId } from "~/server/db/queries/authenticator";
import "~/types";
import { type Nullable, type WithRequired } from "~/types";
import { generateRandomString } from "~/utils/text";

export const getRegistrationOptions = async (user: Nullable<WithRequired<User, "id">>) => {
    const passKeys = user ? await getPasskeysByUserId(user.id) : [];

    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/registration/generateRegistrationOptions.ts
    return generateRegistrationOptions({
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
};

export const getAuthenticationOptions = async () => {
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/generateAuthenticationOptions.ts
    return generateAuthenticationOptions({ rpID });
};
