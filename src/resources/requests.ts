import { type PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { IS_LOGIN_QUERY_PARAM } from "~/resources/constants";
import { WEBAUTHN_ENDPOINT } from "~/resources/endpoints";
import { type Response as CustomResponse } from "~/types";
import { type VerifyScheme } from "~/types/requests";

const handleResponse = async <TData>(response: Response): Promise<CustomResponse<TData>> => {
    if (!response.ok) return { success: false, message: "Something went wrong, try again later..." };
    return (await response.json()) as CustomResponse<TData>;
};

export const getOptions = async (isLogin: boolean) => {
    if (typeof window === "undefined") throw new Error("getOptions can only be called from the client!");

    const url = new URL(WEBAUTHN_ENDPOINT, window.location.origin);
    url.searchParams.set(IS_LOGIN_QUERY_PARAM, `${isLogin}`);

    const response = await fetch(url.toString());
    return handleResponse<PublicKeyCredentialCreationOptionsJSON>(response);
};

export const verify = async (body: VerifyScheme) => {
    const response = await fetch(WEBAUTHN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    return handleResponse<{ verified: boolean }>(response);
};
