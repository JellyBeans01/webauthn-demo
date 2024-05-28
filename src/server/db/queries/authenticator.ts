import { db } from "~/server/db";

export const getPasskeysByUserId = (userId: string) => db.authenticator.findMany({ where: { userId } });
