import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type z from "zod";
import { env } from "~/env";
import { type verificationScheme } from "~/server/api/routers/auth-router";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { api } from "~/trpc/server";

export async function POST(req: NextRequest) {
    const data = (await req.json()) as z.infer<typeof verificationScheme>;

    const response = await api.auth.verify(data);

    // Delete the challenge cookie
    cookies().delete(CHALLENGE_COOKIE);

    if (!response.success) return NextResponse.json(response);

    // Save the session token in the next-auth cookie
    const { sessionToken, verified } = response.data;

    // Create the session cookie
    cookies().set(env.NEXTAUTH_SESSION_TOKEN_COOKIE, sessionToken, { secure: true });

    // Let's not return the session token to the frontend
    return NextResponse.json({ success: true, data: { verified } });
}
