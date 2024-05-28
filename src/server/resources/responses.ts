import "server-only";
import { type ErrorResponse, type SuccessResponse } from "~/types";

export const apiSuccess = <TData>(data: TData): SuccessResponse<TData> => ({ success: true, data });
export const apiError = (message: string): ErrorResponse => ({ success: false, message });
