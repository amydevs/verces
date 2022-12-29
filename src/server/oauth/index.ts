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
                scope: "read write follow push admin",
            },
            ...(await prisma.oauthApplication.findMany() as any)
        ],
        scopes: ["read", "write", "follow", "push", "admin"],
        claims: {
            openid: ["sub"],
            email: ["email", "email_verified"]
        },
        responseTypes: ["code"],
        pkce: {
            methods: ["S256"],
            required: () => false
        },
        features: {
            devInteractions: {
                enabled: false
            }
        },
        adapter: PrismaAdapter,
        findAccount: async (_ctx, id) => {
            const user = await prisma.user.findFirst({
                where: {
                    id
                }
            });
            if (!user) {
                return undefined;
            }

            return {
                accountId: id,
                claims(_use, _scope, _claims, _rejected) {
                    return {
                        sub: id,
                        email: user.email,
                        email_verified: user.emailVerified
                    };
                },
            };
        }
    });
};

export default generateProvider;