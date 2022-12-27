import Provider from "oidc-provider";
import { getIndexUri } from "lib/uris";
import { prisma } from "server/db/client";

const generateProvider = async () => {
    return new Provider(getIndexUri(), {
        routes: {
            authorization: "/oauth/authorize",
            token: "/oauth/token",
            revocation: "/oauth/revoke"
        },
        clients: [
            {
                client_id: "app",
                client_secret: "secret",
                redirect_uris: ["http://localhost:3000/cb"],
                grant_types: ["authorization_code"],
                scope: "openid",
            },
            ...(await prisma.oauthApplication.findMany() as any)
        ]
    });
};

export default generateProvider;