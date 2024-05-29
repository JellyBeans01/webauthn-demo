import { type Authenticator } from "@prisma/client";
import { verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import type {
    AuthenticationResponseJSON,
    AuthenticatorTransportFuture,
    RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { rpID, origin } from "~/config/webauthn";
import { env } from "~/env";

const expectedOrigin = `${origin}${env.NODE_ENV === "development" ? ":3000" : ""}`;

export const verifyRegistration = async (registration: RegistrationResponseJSON, challenge: string) => {
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/verifyAuthenticationResponse.ts
    return verifyRegistrationResponse({
        response: registration,
        expectedOrigin,
        expectedRPID: rpID,
        expectedChallenge: challenge, // Challenge we stored in the cookies
        requireUserVerification: false,
    });
};

export const verifyAuthentication = async (
    authentication: AuthenticationResponseJSON,
    authenticator: Authenticator,
    challenge: string,
) => {
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/verifyAuthenticationResponse.ts
    return verifyAuthenticationResponse({
        response: authentication,
        expectedOrigin,
        expectedRPID: rpID,
        expectedChallenge: challenge, // Challenge we stored in the cookies
        authenticator: {
            credentialID: authenticator.credentialID,
            credentialPublicKey: isoUint8Array.fromHex(authenticator.credentialPublicKey),
            counter: authenticator.counter,
            transports: (authenticator.transports?.split(",") ?? []) as AuthenticatorTransportFuture[],
        },
    });
};
