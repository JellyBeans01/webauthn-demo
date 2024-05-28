import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type z from "zod";
import { type verificationScheme } from "~/server/api/routers/auth-router";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { api } from "~/trpc/server";

export async function POST(req: NextRequest) {
    const data = (await req.json()) as z.infer<typeof verificationScheme>;

    const response = await api.auth.verifyRegistration(data);

    // Delete the cookie
    cookies().delete(CHALLENGE_COOKIE);

    return NextResponse.json(response);
}
