import { type PropsWithChildren, type ReactElement } from "react";

export type ParallelPageProps<TPages extends string[]> = PropsWithChildren<{ [key in TPages[number]]: ReactElement }>;
