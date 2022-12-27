import Provider from "oidc-provider";
import { getIndexUri } from "lib/uris";

const provider = new Provider(getIndexUri(), {
    routes: {
        authorization: "/oauth/authorize",
        token: "/oauth/token",
        revocation: "/oauth/revoke"
    }
});

export default provider;