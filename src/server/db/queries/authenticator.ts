import { db } from "~/server/db";

export const getAuthenticatorsByUserId = (userId: string) => db.authenticator.findMany({ where: { userId } });

export const getAuthenticatorByCredentialId = (id: string) => {
    return db.authenticator.findFirst({ where: { credentialID: id }, include: { user: true } });
};
