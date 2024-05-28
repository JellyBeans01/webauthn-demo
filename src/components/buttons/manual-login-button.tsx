"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { type PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { memo, type PropsWithChildren, useCallback, useState } from "react";
import { toast } from "sonner";
import { type ButtonProps } from "~/components/buttons/button";
import LoadingButton from "~/components/buttons/loading-button";
import { api } from "~/trpc/client";

export type Props = PropsWithChildren<Omit<ButtonProps, "onClick">>;

function ManualLoginButton({ children, ...props }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { refetch } = api.auth.generateRegistrationOptions.useQuery(undefined, { enabled: false });

    const handleRegistration = useCallback(async (options: PublicKeyCredentialCreationOptionsJSON) => {
        try {
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

    const login = useCallback(async () => {
        try {
            setIsLoading(true);

            // Get the registration options
            const { data: registrationOptionsResponse } = await refetch();
            if (!registrationOptionsResponse) return;

            if (!registrationOptionsResponse.success) {
                toast.error(registrationOptionsResponse.message);
                return;
            }

            // Pass the options to the authenticator and wait for a response
            const registration = await handleRegistration(registrationOptionsResponse.data);
            if (!registration) return; // Already handled by the handleRegistration function

            // TODO: Verify registration
            console.log(registration);
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong, try again later...");
        } finally {
            setIsLoading(false);
        }
    }, [handleRegistration, refetch]);

    return (
        <LoadingButton {...props} isLoading={isLoading} onClick={login}>
            {children}
        </LoadingButton>
    );
}

export default memo(ManualLoginButton);
