import { PrismaClient } from "@prisma/client";
import "server-only";
import { env } from "~/env";

export const db = new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
