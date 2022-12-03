import { env } from "env/server.mjs";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { version } from '../../../../../package.json'
import { z } from "zod";

export const oauthRouter = router({
    
})