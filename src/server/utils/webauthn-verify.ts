import { type Authenticator } from "@prisma/client";
import { verifyAuthenticationResponse, verifyRegistrationResponse } from "@simplewebauthn/server";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { rpID, origin } from "~/config/webauthn";
import { env } from "~/env";

const expectedOrigin = `${origin}${env.NODE_ENV === "development" ? ":3000" : ""}`;

export const verifyRegistration = async (response: RegistrationResponseJSON, challenge: string) => {
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/verifyAuthenticationResponse.ts
    return verifyRegistrationResponse({
        response,
        expectedOrigin,
        expectedRPID: rpID,
        expectedChallenge: challenge, // Challenge we stored in the cookies
        requireUserVerification: false,
    });
};

export const verifyAuthentication = async (
    response: AuthenticationResponseJSON,
    authenticator: Authenticator,
    challenge: string,
) => {
    // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/server/src/authentication/verifyAuthenticationResponse.ts
    return verifyAuthenticationResponse({
        response,
        expectedOrigin,
        expectedRPID: rpID,
        expectedChallenge: challenge, // Challenge we stored in the cookies
        authenticator: {
            // TODO
        },
    });
};
