import { type HTMLAttributes } from "react";
import { cn } from "~/utils/style";

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("animate-pulse rounded-md bg-white/10", className)} {...props} />;
}

export { Skeleton };
