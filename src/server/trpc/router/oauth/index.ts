import { env } from "env/server.mjs";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { version } from '../../../../../package.json'
import { z } from "zod";

export const oauthRouter = router({
    authorize: publicProcedure
        .input(z.object({
            client_id: z.string(),
            redirect_uri: z.string(),
            response_type: z.string(),
            scope: z.string()
        }))
        .mutation(() => {
            return {
                code: ""
            }
        })
})