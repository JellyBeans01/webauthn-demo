import type { Authenticator } from "@prisma/client";
import { type User } from "next-auth";
import { encode } from "next-auth/jwt";
import { env } from "~/env";
import { db } from "~/server/db";
import { type WithRequired } from "~/types";

const generateSessionToken = async (user: User) => {
    const maxAge = 30 * 86400; // 30 days
    const expires = new Date(Date.now() + maxAge * 1_000);

    const sessionToken = await encode({
        maxAge,
        token: user,
        secret: env.NEXTAUTH_SECRET,
        salt: env.SESSION_TOKEN_SALT,
    });

    return { sessionToken, expires };
};

export const createSession = async (user: WithRequired<User, "id">) => {
    const { expires, sessionToken } = await generateSessionToken(user);

    return db.session.create({
        data: {
            expires,
            sessionToken,
            user: {
                connect: {
                    id: user.id,
                },
            },
        },
    });
};

export const createAuthenticator = async (userId: string, authenticator: Omit<Authenticator, "userId">) => {
    return db.authenticator.create({
        data: {
            ...authenticator,
            user: {
                connect: {
                    id: userId,
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
            // Creates the user account
            accounts: {
                create: {
                    type: "",
                    provider: "webauthn",
                    providerAccountId: "webauthn",
                },
            },
        },
    });

    const { password: _password, ...sessionUser } = newUser;

    const [session] = await Promise.all([createSession(sessionUser), createAuthenticator(newUser.id, authenticator)]);

    return session.sessionToken;
};
