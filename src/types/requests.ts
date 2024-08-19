import z from "zod";

export const verificationScheme = z.object({
    id: z.string(),
    type: z.string(),
    authenticatorAttachment: z.enum(["cross-platform", "platform"]).optional(),
    rawId: z.string(),
    response: z.any(),
    clientExtensionResults: z.any(),
});

const verifyScheme = z.object({
    isLogin: z.boolean(),
    response: verificationScheme,
});

export type VerifyScheme = z.infer<typeof verifyScheme>;
