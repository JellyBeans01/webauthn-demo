export type WithRequired<TType, Key extends keyof TType> = TType & { [P in Key]-?: TType[P] };

export type Nullable<TType> = TType | null;
export type Nullish<TType> = Nullable<TType> | undefined;

export * from "./responses";
