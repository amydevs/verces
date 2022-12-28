import Provider from "oidc-provider";
import { getIndexUri } from "lib/uris";
import { prisma } from "server/db/client";
import { env } from "env/server.mjs";

import { PrismaAdapter } from "./prisma-adapter";

const generateProvider = async () => {
    return new Provider(getIndexUri(), {
        routes: {
            authorization: "/oauth/authorize",
            token: "/oauth/token",
            revocation: "/oauth/revoke"
        },
        clients: [
            {
                client_id: "webapp",
                client_secret: env.NEXTAUTH_SECRET,
                redirect_uris: [new URL("/api/auth/callback/mastodon", getIndexUri()).toString()],
                grant_types: ["authorization_code"],
                scope: "openid",
            },
            ...(await prisma.oauthApplication.findMany() as any)
        ],
        scopes: ["read", "write", "follow", "push", "admin"],
        responseTypes: ["code"],
        pkce: {
            methods: ["S256", "plain"],
            required: () => false
        },
        adapter: PrismaAdapter
    });
};

export default generateProvider;