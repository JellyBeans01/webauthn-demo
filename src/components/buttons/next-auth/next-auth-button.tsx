"use client";

import { signIn } from "next-auth/webauthn";
import { memo, type PropsWithChildren, useCallback, useState } from "react";
import { toast } from "sonner";
import { type ButtonProps } from "~/components/buttons/button";
import LoadingButton from "~/components/buttons/loading-button";

// https://authjs.dev/getting-started/authentication/webauthn

export type Props = PropsWithChildren<Omit<ButtonProps, "type" | "onClick"> & { isLogin?: boolean }>;

function NextAuthButton({ children, isLogin = false, ...props }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const login = useCallback(async () => {
        try {
            setIsLoading(true);
            await signIn("passkey", !isLogin ? { action: "register" } : undefined);
        } catch (err) {
            console.log(err);
            toast.error("something went wrong when trying to log in");
        } finally {
            setIsLoading(false);
        }
    }, [isLogin]);

    return (
        <LoadingButton {...props} type="button" isLoading={isLoading} onClick={login}>
            {children}
        </LoadingButton>
    );
}

export default memo(NextAuthButton);
