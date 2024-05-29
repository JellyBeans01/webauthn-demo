import type { Authenticator } from "@prisma/client";
import { type User } from "next-auth";
import { encode } from "next-auth/jwt";
import { env } from "~/env";
import { db } from "~/server/db";

const generateSessionToken = async (user: User) => {
    const maxAge = 30 * 86400; // 30 days
    const expires = new Date(Date.now() + maxAge * 1_000);

    const token = await encode({ maxAge, token: user, secret: env.NEXTAUTH_SECRET, salt: env.SESSION_TOKEN_SALT });

    return { token, expires };
};

export const registerNewUserAndSignIn = async (user: User, authenticator: Omit<Authenticator, "userId">) => {
    const { expires, token } = await generateSessionToken(user);

    await db.user.create({
        data: {
            name: user.name,
            email: user.email,
            image: user.image,
            authenticator: {
                create: authenticator,
            },
            sessions: {
                create: {
                    expires,
                    sessionToken: token,
                },
            },
            accounts: {
                create: {
                    type: "",
                    provider: "webauthn",
                    providerAccountId: "webauthn",
                },
            },
        },
    });

    return token;
};
