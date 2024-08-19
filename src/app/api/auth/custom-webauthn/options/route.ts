import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { IS_LOGIN_QUERY_PARAM } from "~/resources/constants";
import { CHALLENGE_COOKIE } from "~/server/resources/constants";
import { api } from "~/trpc/server";

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
