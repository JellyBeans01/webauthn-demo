import { db } from "~/server/db";

export const getAuthenticatorsByUserId = (userId: string) => db.authenticator.findMany({ where: { userId } });

export const getAuthenticatorByCredentialId = (id: string) => {
    return db.authenticator.findFirst({ where: { credentialID: id }, include: { user: true } });
};

export const removeAuthenticatorByCredentialId = async (credentialID: string, userId: string) => {
    const authenticator = await getAuthenticatorByCredentialId(credentialID);
    if (!authenticator || authenticator.user.id !== userId) return null;

    return db.authenticator.delete({ where: { credentialID, AND: { userId } } });
};
