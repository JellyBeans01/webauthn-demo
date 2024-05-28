"use client";

import { Loader2 } from "lucide-react";
import { memo, type PropsWithChildren } from "react";
import Button, { type ButtonProps } from "~/components/buttons/button";

export type Props = PropsWithChildren<ButtonProps & { isLoading: boolean }>;

function LoadingButton({ children, isLoading, disabled, ...props }: Props) {
    return (
        <Button disabled={disabled || isLoading} {...props}>
            {isLoading ? (
                <div className="inline-grid grid-cols-1 justify-center items-center h-full">
                    <Loader2 className="animate-spin" />
                </div>
            ) : (
                children
            )}
        </Button>
    );
}

export default memo(LoadingButton);
