import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import Passkey from "next-auth/providers/passkey";
import "server-only";
import { env } from "~/env";
import { db } from "~/server/db";
import { type Nullable } from "~/types";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            name: string;
            email: Nullable<string>;
            emailVerified: Nullable<string>;
            image: Nullable<string>;
            password: Nullable<string>;
        } & DefaultSession["user"];
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    callbacks: {
        session: ({ session, user }) => {
            const { password: _password, ...sessionUser } = session.user;

            return {
                ...session,
                user: {
                    ...sessionUser,
                    id: user.id,
                },
            };
        },
    },
    adapter: PrismaAdapter(db),
    providers: [Passkey],
    experimental: { enableWebAuthn: true },
    cookies: {
        sessionToken: {
            name: env.NEXTAUTH_SESSION_TOKEN_COOKIE,
        },
    },
    logger: {
        warn: () => undefined, // Removes annoying logs
    },
});
