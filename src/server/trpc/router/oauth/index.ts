import { env } from "env/server.mjs";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { z } from "zod";
import { generateSecret } from "../utils";
import { zError } from "server/trpc/zod";

export const oauthRouter = router({
    authorize: protectedProcedure
        .input(z.object({
            client_id: z.string(),
            redirect_uri: z.string(),
            response_type: z.string(),
            scope: z.string()
        }))
        .mutation(async ({ctx, input}) => {
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            const client = await ctx.prisma.oauthApplication.findFirst({
                where: {
                    clientId: input.client_id,
                    redirectUris: {
                        array_contains: input.redirect_uri
                    }
                }
            })
            if (!client) {
                throw {
                    error: "Redirect Not Found",
                    description: "Redirect Not Found"
                } as typeof zError._type
            }
            const grant = await ctx.prisma.oauthAccessGrant.create({
                data: {
                    application: {
                        connect: {
                            clientId: input.client_id
                        }
                    },
                    redirectUri: input.redirect_uri,
                    user: {
                        connect: {
                            id: ctx.session.user.id
                        }
                    },
                    scopes: input.scope.split(" "),
                    expiresAt,
                    token: await generateSecret()              
                }
            })
            return {
                code: grant.token
            }
        })
})