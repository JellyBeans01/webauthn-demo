"use client";

import { memo, type PropsWithChildren, useCallback, useState } from "react";
import { type ButtonProps } from "~/components/buttons/button";
import LoadingButton from "~/components/buttons/loading-button";

export type Props = PropsWithChildren<Omit<ButtonProps, "onClick">>;

function ManualLoginButton({ children, ...props }: Props) {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const login = useCallback(() => {
        setIsLoading(true);
    }, []);

    return (
        <LoadingButton {...props} isLoading={isLoading} onClick={login}>
            {children}
        </LoadingButton>
    );
}

export default memo(ManualLoginButton);
