import { publicProcedure, router } from "server/trpc/trpc";
import { z } from "zod";
import { prisma } from "server/db/client";
import { generateSecret } from "../utils";
import { zError } from "server/trpc/zod";

export const appsRouter = router({
    create: publicProcedure
        .meta({ openapi: { method: 'POST', path: '/v1/apps' } })
        .input(z.object({
            client_name: z.string(),
            redirect_uris: z.string(),
            scopes: z.string().optional(),
            website: z.string().optional()
        }))
        .output(z.object({
            id: z.string(),
            name: z.string(),
            website: z.string().optional(),
            redirect_uri: z.string(),
            client_id: z.string(),
            client_secret: z.string(),
            vapid_key: z.string().optional()
        }).or(zError))
        .mutation(async ({input}) => {            
            const application = await prisma.oauthApplication.create({
                data: {
                    id: "sdsd",
                    name: input.client_name,
                    scopes: input.scopes?.split(" "),
                    redirectUris: [input.redirect_uris],
                    clientSecret: await generateSecret()
                }
            });
            
            return {
                id: application.id,
                name: application.name,
                website: input.website,
                redirect_uri: input.redirect_uris,
                client_id: application.clientId,
                client_secret: application.clientSecret,
            }
        })
});