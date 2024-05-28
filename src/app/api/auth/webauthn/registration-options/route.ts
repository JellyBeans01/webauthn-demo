import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { api } from "~/trpc/server";

export async function GET() {
    const response = await api.auth.generateRegistrationOptions();

    // Save the challenge in a cookie,
    // since we need this to verify the registration when the user adds an authenticator
    if (response.success) {
        cookies().set(CHALLENGE_COOKIE, response.data.challenge, { secure: true });
    }

    // Forward the response to the frontend
    return NextResponse.json(response);
}
