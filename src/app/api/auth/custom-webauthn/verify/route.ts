import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { api } from "~/trpc/server";
import { type VerifyScheme } from "~/types/requests";

export async function POST(req: NextRequest) {
    const data = (await req.json()) as VerifyScheme;

    const { isLogin, response } = data;

    const verifier = isLogin ? api.auth.verifyAuthentication : api.auth.verifyRegistration;

    const verifierResponse = await verifier(response);

    // Delete the challenge cookie
    cookies().delete(CHALLENGE_COOKIE);

    // When the request failed: just forward the response to the client, so it can handle it
    if (!verifierResponse.success) return NextResponse.json(verifierResponse);

    // Create the session cookie
    const { sessionToken, verified } = verifierResponse.data;
    cookies().set(env.NEXTAUTH_SESSION_TOKEN_COOKIE, sessionToken, { secure: true });

    // Let's not return the session token to the frontend
    return NextResponse.json({ success: true, data: { verified } });
}
