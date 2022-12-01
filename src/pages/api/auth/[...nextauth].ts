import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import Auth0Provider from "next-auth/providers/auth0";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { generateKeyPair } from "server/activitypub/keypair";

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    jwt({token, account}) {
      console.log(token, account)
      return token; 
    }
  },
  events: {
    async createUser({user}) {
      const keys = await generateKeyPair();
      await prisma.keyPair.upsert({
        where: {
          userId: user.id
        },
        update: {},
        create: {
          userId: user.id,
          ...keys
        }
      });
    },
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    Auth0Provider({
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      issuer: env.AUTH0_ISSUER,
      profile(profile) {
        console.log(profile)
        return {
          id: profile.sub,
          name: profile.preferred_username || profile.nickname,
          email: profile.email,
          image: profile.picture,
        }
      },
    })
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);
