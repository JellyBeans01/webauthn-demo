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

    const handlePasskey = useCallback(
        async (options: PublicKeyCredentialCreationOptionsJSON) => {
            try {
                const action = isLogin
                    ? startAuthentication // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/browser/src/methods/startAuthentication.ts
                    : startRegistration; // https://github.com/MasterKale/SimpleWebAuthn/blob/master/packages/browser/src/methods/startRegistration.ts

                return action(options);
            } catch (err) {
                const error = err as { name: string };

                const errorMessage =
                    error.name === "InvalidStateError"
                        ? "Error: Authenticator was probably already registered by user"
                        : "Something went wrong, try again later...";

                toast.error(errorMessage);

                return null;
            }
        },
        [isLogin],
    );

    const login = useCallback(async () => {
        try {
            setIsLoading(true);

            // Get the registration options
            const optionsResponse = await getOptions(isLogin);
            if (!optionsResponse.success) {
                toast.error(optionsResponse.message);
                return;
            }

            // Pass the options to the authenticator and wait for a response
            const passkeyResponse = await handlePasskey(optionsResponse.data);
            if (!passkeyResponse) return; // Already handled by the handleRegistration function

            // Verify registration
            const verifyResponse = await verify({ response: passkeyResponse, isLogin });
            if (!verifyResponse.success) {
                toast.error(verifyResponse.message);
                return;
            }

            console.log("router should be refreshing");

            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong, try again later...");
        } finally {
            setIsLoading(false);
        }
    }, [handlePasskey, isLogin, router]);

    return (
        <LoadingButton {...props} type="button" isLoading={isLoading} onClick={login}>
            {children}
        </LoadingButton>
    );
}

export default memo(ManualButton);
