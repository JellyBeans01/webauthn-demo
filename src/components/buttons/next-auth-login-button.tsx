"use client";

import { signIn } from "next-auth/webauthn";
import { memo, type PropsWithChildren, useCallback, useState } from "react";
import { toast } from "sonner";
import { type ButtonProps } from "~/components/buttons/button";
import LoadingButton from "~/components/buttons/loading-button";

export type Props = PropsWithChildren<Omit<ButtonProps, "onClick">>;

function NextAuthLoginButton({ children, ...props }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const login = useCallback(async () => {
        try {
            setIsLoading(true);
            await signIn("passkey");
        } catch (err) {
            console.log(err);
            toast.error("something went wrong when trying to login");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <LoadingButton {...props} isLoading={isLoading} onClick={login}>
            {children}
        </LoadingButton>
    );
}

export default memo(NextAuthLoginButton);
