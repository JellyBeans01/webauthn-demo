import "server-only";

export const apiSuccess = <TData>(data: TData) => ({ success: true, data }) as const;
export const apiError = (message: string) => ({ success: false, message }) as const;
