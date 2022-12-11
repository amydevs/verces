import { Visibility } from "@prisma/client";
import { router, protectedProcedure } from "server/trpc/trpc";
import { z } from "zod";

export const statusesRouter = router({
    create: protectedProcedure
        .meta({ openapi: { method: "POST", path: "/v1/statuses" } })
        .input(z.object({
            status: z.string(),
            media_ids: z.string().array(),
            poll: z.object({
                options: z.string().array(),
                expires_in: z.number(),
                multiple: z.boolean().optional(),
                hide_totals: z.boolean().optional(),
            }).optional(),
            in_reply_to_id: z.string().optional(),
            sensitive: z.boolean().optional(),
            spoiler_text: z.string().optional(),
            visibility: z.enum([ "public", "unlisted", "private", "direct" ]).optional(),
            language: z.string().optional(),
        }))
        .mutation(({ ctx, input }) => {
            let visibility;
            if (input.visibility) {
                visibility = (input.visibility.charAt(0).toUpperCase + input.visibility.slice(1)) as Visibility;
            }
            return ctx.prisma.status.create({
                data: {
                    text: input.status,
                    userId: ctx.session.user.id,
                    ...({visibility} ?? {}),
                }
            });
        })
});