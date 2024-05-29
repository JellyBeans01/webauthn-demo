import { type NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

const protectedRoutes = ["/very-secure-page"];

export default async function middleware(req: NextRequest) {
    const session = req.cookies.get(env.NEXTAUTH_SESSION_TOKEN_COOKIE);

    const isProtectedRoute = protectedRoutes.some((path) => req.nextUrl.pathname.startsWith(path));
    if (!session && isProtectedRoute) {
        // Redirect the user back to home
        const absoluteURL = new URL("/", req.nextUrl.origin);
        return NextResponse.redirect(absoluteURL.toString());
    }
}
