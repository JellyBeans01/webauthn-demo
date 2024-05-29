import { db } from "~/server/db";

export const getUserById = async (id: string) => db.user.findUnique({ where: { id } });
