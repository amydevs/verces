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
      },
      {
        source: '/@/:user',
        destination: '/api/parent/users/:user',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?<b>.*application\\/activity\\+json.*)'
          }
        ]
      },
      {
        source: '/@/:user/:status*',
        destination: '/api/parent/users/:user/statuses/:status*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?<b>.*application\\/activity\\+json.*)'
          }
        ]
      }
    ]
  },
  async redirects () {
    return [
      {       
        source: '/users/:user',
        destination: '/:user',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?<a>^((?!application\\/activity\\+json).)*$)'
          }
        ],
        permanent: true
      },
      {       
        source: '/users/:user/statuses/:status',
        destination: '/:user/:status',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?<a>^((?!application\\/activity\\+json).)*$)'
          }
        ],
        permanent: true
      }
    ]
  }
};
export default config;
