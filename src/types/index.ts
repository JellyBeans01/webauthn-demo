export type WithRequired<TType, Key extends keyof TType> = TType & { [P in Key]-?: TType[P] };
