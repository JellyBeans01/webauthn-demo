import type { Authenticator } from "@prisma/client";
import { type User } from "next-auth";
import { encode } from "next-auth/jwt";
import { env } from "~/env";
import { db } from "~/server/db";
import { type WithRequired } from "~/types";

const generateSessionToken = async (user: User) => {
    const maxAge = 30 * 86400; // 30 days
    const expires = new Date(Date.now() + maxAge * 1_000);

    const token = await encode({ maxAge, token: user, secret: env.NEXTAUTH_SECRET, salt: env.SESSION_TOKEN_SALT });

    return { token, expires };
};

export const createSession = async (user: WithRequired<User, "id">) => {
    const { expires, token } = await generateSessionToken(user);

    return db.session.create({
        data: {
            expires,
            sessionToken: token,
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    });
};

export const registerNewUserAndSignIn = async (user: User, authenticator: Omit<Authenticator, "userId">) => {
    const newUser = await db.user.create({
        data: {
            name: user.name,
            email: user.email,
            image: user.image,
            authenticator: {
                create: authenticator,
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

    const session = await createSession(newUser);

    return session.sessionToken;
};
