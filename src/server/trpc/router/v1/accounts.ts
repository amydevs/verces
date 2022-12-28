import { url } from "inspector";
import { publicProcedure, router } from "server/trpc/trpc";
import { string, z } from "zod";

export const accountsRouter = router({
    get: publicProcedure
        .meta({ openapi: { method: "GET", path: "/v1/accounts/{userIndex}" } })
        .input(z.object({
            userIndex: z.string()
        }))
        .output(z.object({
            id: z.string(),
            username: z.string(),
            acct: z.string(),
            display_name: z.string().nullable(),
            locked: z.boolean(),
            bot: z.boolean(),
            created_at: z.string(),
            note: z.string()
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