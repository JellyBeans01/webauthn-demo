import { TRPCError } from "@trpc/server";

export default class Unauthorized extends TRPCError {
    constructor(message?: string) {
        super({ message, code: "UNAUTHORIZED" });
    }
}
