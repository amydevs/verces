import { env } from "env/server.mjs";
import { router, publicProcedure, protectedProcedure } from "../../trpc";
import { version } from "../../../../../package.json";
import { z } from "zod";
import { appsRouter } from "./apps";
import { statusesRouter } from "./statuses";
import { accountsRouter } from "./accounts";

export const v1Router = router({
    instance: publicProcedure
        .meta({ openapi: { method: "GET", path: "/v1/instance" } })
        .input(z.void())
        .output(z.object({
            domain: z.string(),
            title: z.string(),
            version: z.string(),
            source_url: z.string(),
            description: z.string()
        }))
        .query(() => {
            return {
                domain: env.HOST,
                title: "Verces",
                version,
                source_url: "https://github.com/mastodon/mastodon",
                description: "Serverless Activitypub"
            };
        }),
    accounts: accountsRouter,
    apps: appsRouter,
    statuses: statusesRouter
});
