"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, memo, type PropsWithChildren } from "react";
import { type WithRequired } from "~/types";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 rounded-md text-base font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-white/25 hover:bg-white/35",
                destructive: "bg-red-600 hover:bg-red-700/95",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

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
