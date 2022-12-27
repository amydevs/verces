import Provider from "oidc-provider";

const provider = new Provider("http://localhost:3000/", {
    routes: {
        authorization: "/oauth/authorize",
        token: "/oauth/token",
        revocation: "/oauth/revoke"
    }
});

export default provider;