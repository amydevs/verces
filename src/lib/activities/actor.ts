import type { IActor } from "./type";
import { getApObjectBody } from "./utils";
import { prisma } from "server/db/client";
import type { Prisma, PrismaClient } from "@prisma/client";

export const userFromActor = async (actor: IActor | string, xprisma: PrismaClient | Prisma.TransactionClient = prisma) => {
    const publicActor = await getApObjectBody(actor) as IActor;

    const updateData: Prisma.UserCreateArgs = {
        data: {
            name: `${publicActor.preferredUsername}`,
            host: new URL(`${publicActor.id}`).host,
            ...(publicActor.publicKey ? {
                keyPair: {
                    connectOrCreate: {
                        where: {
                            publicKey: publicActor.publicKey.publicKeyPem
                        },
                        create: {
                            publicKey: publicActor.publicKey.publicKeyPem
                        }
                    },
                }
            } : {}),
            uri: publicActor.id,
            url: publicActor.url?.toString(),
        }
    };

    let tempDbActor = undefined;
    try {
        tempDbActor = await xprisma.user.update({
            data: {
                ...updateData.data,
                updatedAt: new Date()
            },
            where: {
                uri: typeof actor === "string" ? actor : actor.id,
            },
        });
    }
    catch {
        tempDbActor = await xprisma.user.findFirst({
            where: {
                uri: typeof actor === "string" ? actor : actor.id
            }
        });
    }

        
    return tempDbActor ?? 
        await (async () => {
            return xprisma.user.create({
                ...updateData
            });
        })();
};