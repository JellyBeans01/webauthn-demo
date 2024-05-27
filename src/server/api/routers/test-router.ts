import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const testRouter = createTRPCRouter({
    test: publicProcedure.query(() => {
        return "test";
    }),
});
