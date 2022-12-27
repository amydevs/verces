import { url } from "inspector";
import { publicProcedure, router } from "server/trpc/trpc";
import { z } from "zod";

export const accountsRouter = router({
    get: publicProcedure
        .meta({ openapi: { method: "GET", path: "/v1/accounts/{userIndex}" } })
        .input(z.object({
            userIndex: z.string()
        }))
        .query(async ({input, ctx}) => {
            const user = await ctx.prisma.user.findFirstOrThrow({
                where: {
                    name: input.userIndex
                }
            });
            return {
                id: user.id,
                username: user.name,
                acct: user.name,
                display_name: user.displayName,
                locked: false,
                bot: false,
                created_at: user.createdAt.toISOString(),
                note: "<p>Note Placeholder</p>",
            };
        })
});