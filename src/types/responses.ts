export type SuccessResponse<TData> = { success: true; data: TData };
export type ErrorResponse = { success: false; message: string };

export type Response<TData> = SuccessResponse<TData> | ErrorResponse;
