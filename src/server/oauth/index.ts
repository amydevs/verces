import Provider from "oidc-provider";

const provider = new Provider("http://localhost:3000/", {
    routes: {
        authorization: "/authorization"
    }
});

export default provider;