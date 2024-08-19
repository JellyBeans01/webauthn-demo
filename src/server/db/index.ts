import { PrismaClient } from "@prisma/client";
import "server-only";
import { env } from "~/env";

declare global {
    // eslint-disable-next-line no-var,vars-on-top
    var db: PrismaClient | undefined;
}

const createPrismaClient = () => {
    return new PrismaClient({ log: env.NODE_ENV === "development" ? [/*"query", */ "error", "warn"] : ["error"] });
};

export const db = global.db || createPrismaClient();

if (env.NODE_ENV !== "production") {
    global.db = db;
}
