"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, memo, type PropsWithChildren } from "react";
import { type WithRequired } from "~/types";

const buttonVariants = cva("px-5 py-2.5 rounded transition-colors", {
    variants: {
        variant: {
            default: "bg-white/25 hover:bg-white/35",
            destructive: "bg-red-600 hover:bg-red-700/95",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

export type ButtonProps = WithRequired<ButtonHTMLAttributes<HTMLButtonElement>, "type"> &
    VariantProps<typeof buttonVariants>;
export type Props = PropsWithChildren<ButtonProps>;

function Button({ children, className, variant, ...props }: Props) {
    return (
        <button className={buttonVariants({ variant, className })} {...props}>
            {children}
        </button>
    );
}

export default memo(Button);
