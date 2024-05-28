import { type PublicKeyCredentialCreationOptionsJSON, type RegistrationResponseJSON } from "@simplewebauthn/types";
import { WEBAUTHN_REGISTRATION_OPTIONS, WEBAUTHN_VERIFY } from "~/resources/endpoints";
import { type Response as CustomResponse } from "~/types";

const handleResponse = async <TData>(response: Response): Promise<CustomResponse<TData>> => {
    if (!response.ok) return { success: false, message: "Something went wrong, try again later..." };
    return (await response.json()) as CustomResponse<TData>;
};

export const getRegistrationOptions = async () => {
    const response = await fetch(WEBAUTHN_REGISTRATION_OPTIONS);
    return handleResponse<PublicKeyCredentialCreationOptionsJSON>(response);
};

export const verifyRegistration = async (body: RegistrationResponseJSON) => {
    const response = await fetch(WEBAUTHN_VERIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    return handleResponse<{ verified: boolean }>(response);
};
