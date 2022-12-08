import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import Auth0Provider from "next-auth/providers/auth0";
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db/client";
import { generateKeyPair } from "lib/signature";

const giveKeysToUserIfNone = async (userId: string) => {
    const keys = await generateKeyPair();
    return await prisma.keyPair.upsert({
        where: {
            userId
        },
        update: {},
        create: {
            userId,
            ...keys
        }
    });
};

export const authOptions: NextAuthOptions = {
    // Include user.id on session
    callbacks: {
        session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        }
    },
    events: {
        async createUser({user}) {
            await giveKeysToUserIfNone(user.id);
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
                return {
                    id: profile.sub,
                    name: profile.preferred_username || profile.nickname,
                    email: profile.email,
                    image: profile.picture,
                };
            },
        })
    // ...add more providers here
    ],
};

export default NextAuth(authOptions);
