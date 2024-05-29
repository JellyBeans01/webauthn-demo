"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { type PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { useRouter } from "next/navigation";
import { memo, type PropsWithChildren, useCallback, useState } from "react";
import { toast } from "sonner";
import { type ButtonProps } from "~/components/buttons/button";
import LoadingButton from "~/components/buttons/loading-button";
import { getOptions, verify } from "~/resources/requests";

export type Props = PropsWithChildren<Omit<ButtonProps, "type" | "onClick"> & { isLogin?: boolean }>;

function ManualButton({ children, isLogin = false, ...props }: Props) {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleRegistration = useCallback(async (options: PublicKeyCredentialCreationOptionsJSON) => {
        try {
            console.log(options);
            // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/browser/src/methods/startAuthentication.ts
            return startRegistration(options);
        } catch (err) {
            const error = err as { name: string };

            const errorMessage =
                error.name === "InvalidStateError"
                    ? "Error: Authenticator was probably already registered by user"
                    : "Something went wrong, try again later...";

            toast.error(errorMessage);

            return null;
        }
    }, []);

    const handleAuthentication = useCallback(async (options: PublicKeyCredentialCreationOptionsJSON) => {
        try {
            // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/browser/src/methods/startAuthentication.ts
            return startAuthentication(options);
        } catch (err) {
            console.log(err);
            toast.error("Something went wrong, try again later...");

            return null;
        }
    }, []);

    const login = useCallback(async () => {
        try {
            setIsLoading(true);

            // Get the registration options
            const optionsResponse = await getOptions(isLogin);
            if (!optionsResponse.success) {
                toast.error(optionsResponse.message);
                return;
            }

            // const authentication = await handleAuthentication(registrationOptionsResponse.data);
            // if (!authentication) return; // Already handled by the handleAuthentication function

            // Pass the options to the authenticator and wait for a response
            const registration = await handleRegistration(optionsResponse.data);
            if (!registration) return; // Already handled by the handleRegistration function

            // Verify registration
            const verifyResponse = await verify(registration);
            if (!verifyResponse.success) {
                toast.error(verifyResponse.message);
                return;
            }

            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong, try again later...");
        } finally {
            setIsLoading(false);
        }
    }, [handleRegistration, isLogin, router]);

    return (
        <LoadingButton {...props} type="button" isLoading={isLoading} onClick={login}>
            {children}
        </LoadingButton>
    );
}

export default memo(ManualButton);
