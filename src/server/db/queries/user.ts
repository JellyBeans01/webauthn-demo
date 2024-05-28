import { db } from "~/server/db";

export const getUserById = (id: string) => db.user.findUnique({ where: { id } });
