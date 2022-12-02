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
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/:path*',
        destination: '/api/parent/.well-known/:path*'
      },
      {
        source: '/users/:user*',
        destination: '/api/parent/users/:user*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?<a>.*application\\/activity\\+json.*)'
          }
        ]
      }
    ]
  }
};
export default config;
