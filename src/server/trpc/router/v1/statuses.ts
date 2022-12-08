import { Visibility } from "@prisma/client";
import { publicProcedure, router } from "server/trpc/trpc";
import { z } from "zod";

export const statusesRouter = router({
    create: publicProcedure
        .meta({ openapi: { method: "POST", path: "/v1/statuses" } })
        .input(z.object({
            status: z.string(),
            media_ids: z.string().array(),
            poll: z.object({
                options: z.string().array(),
                expires_in: z.number(),
                multiple: z.boolean().optional(),
                hide_totals: z.boolean().optional(),
                in_reply_to_id: z.string().optional(),
                sensitive: z.boolean().optional(),
                spoiler_text: z.string().optional(),
                visibility: z.enum([ "public", "unlisted", "private", "direct" ])
            }),

        }))
        .mutation(() => {
            return {};
        })
});