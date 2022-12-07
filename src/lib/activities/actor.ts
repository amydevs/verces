import type { IActor } from "./type";
import { getApObjectBody } from "./utils";
import { prisma } from "server/db/client";
import type { Prisma, PrismaClient } from "@prisma/client";

export const userFromActor = async (actor: IActor | string) => {
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


    const tempDbActor = await prisma.user.upsert({
        where: {
            uri: typeof actor === "string" ? actor : actor.id,
        },
        update: {
            ...updateData.data
        },
        create: {
            ...updateData.data
        }
    });

        
    return tempDbActor;
};