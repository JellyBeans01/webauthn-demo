import z from "zod";
import { verificationScheme } from "~/server/api/routers/auth-router";

const verifyScheme = z.object({
    isLogin: z.boolean(),
    response: verificationScheme,
});

export type VerifyScheme = z.infer<typeof verifyScheme>;
