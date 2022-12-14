// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    swcMinify: true,
    // i18n: {
    //     locales: ["en"],
    //     defaultLocale: "en",
    // },
    async rewrites() {
        return [
            // OAuth
            {
                source: "/oauth/:path*",
                destination: "/api/oauth/:path*"
            },
            {
                source: "/.well-known/openid-configuration",
                destination: "/api/oauth/.well-known/openid-configuration"
            },
            {
                source: "/interaction/:uid/:path(.+)",
                destination: "/api/oauth/interaction/:uid/:path"
            },

            // ActivityPub
            {
                source: "/.well-known/:path*",
                destination: "/api/ap/.well-known/:path*"
            },
            {
                source: "/inbox",
                destination: "/api/ap/inbox",
            },
            {
                source: "/nodeinfo",
                destination: "/api/ap/nodeinfo",
            },

            // Users
            {
                source: "/users/:user*",
                destination: "/api/ap/users/:user*",
                has: [
                    {
                        type: "header",
                        key: "accept",
                        value: "(?<a>.*application\\/activity\\+json.*)"
                    }
                ]
            },
            {
                source: "/@/:user",
                destination: "/api/ap/users/:user",
                has: [
                    {
                        type: "header",
                        key: "accept",
                        value: "(?<b>.*application\\/activity\\+json.*)"
                    }
                ]
            },
            {
                source: "/@/:user/:status*",
                destination: "/api/ap/users/:user/statuses/:status*",
                has: [
                    {
                        type: "header",
                        key: "accept",
                        value: "(?<b>.*application\\/activity\\+json.*)"
                    }
                ]
            },

        ];
    },
    async redirects () {
        return [
            {       
                source: "/users/:user",
                destination: "/@/:user",
                has: [
                    {
                        type: "header",
                        key: "accept",
                        value: "(?<a>^((?!application\\/activity\\+json).)*$)"
                    }
                ],
                permanent: true
            },
            {       
                source: "/users/:user/statuses/:status",
                destination: "/@/:user/:status",
                has: [
                    {
                        type: "header",
                        key: "accept",
                        value: "(?<a>^((?!application\\/activity\\+json).)*$)"
                    }
                ],
                permanent: true
            }
        ];
    }
};
export default config;
