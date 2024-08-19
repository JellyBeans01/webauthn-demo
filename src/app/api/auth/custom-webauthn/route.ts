import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { IS_LOGIN_QUERY_PARAM } from "~/resources/constants";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { api } from "~/trpc/server";
import type { VerifyScheme } from "~/types/requests";

// GET request for authentication / registration options
export async function GET(req: NextRequest) {
    const isLogin = new URL(req.url).searchParams.get(IS_LOGIN_QUERY_PARAM) === "true";

    const response = await api.auth.generateOptions({ isLogin });

    // Save the challenge in a cookie,
    // since we need this to verify the registration when the user adds an authenticator
    if (response.success) {
        cookies().set(CHALLENGE_COOKIE, response.data.challenge, { secure: true });
    }

    // Forward the response to the frontend
    return Response.json(response);
}

// POST for authentication / registration verification
export async function POST(req: NextRequest) {
    const data = (await req.json()) as VerifyScheme;

    const { isLogin, response } = data;

    const verifier = isLogin ? api.auth.verifyAuthentication : api.auth.verifyRegistration;

    const verifierResponse = await verifier(response);

    // Delete the challenge cookie
    cookies().delete(CHALLENGE_COOKIE);

    // When the request failed: just forward the response to the client, so it can handle it
    if (!verifierResponse.success) return Response.json(verifierResponse);

    // Create the session cookie if the token is present.
    // This does not always have to be present because a user may add a new authenticator when (s)he is logged in
    const { sessionToken, verified } = verifierResponse.data;
    if (sessionToken) cookies().set(env.NEXTAUTH_SESSION_TOKEN_COOKIE, sessionToken, { secure: true });

    // Let's not return the session token to the frontend
    return Response.json({ success: true, data: { verified } });
}
