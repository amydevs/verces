import type { IActor } from "./type";
import { getApObjectBody } from "./utils";
import { prisma } from "server/db/client";
import type { Prisma, PrismaClient } from "@prisma/client";
import { getIndexUri, getUserStatusFromUri } from "lib/uris";

export const userFromActor = async (actor: IActor | string) => {
    const actorId = typeof actor === "string" ? actor : actor.id;
    if (actorId?.startsWith(getIndexUri())) {
        const { userIndex } = getUserStatusFromUri(actorId);
        return prisma.user.findFirstOrThrow({
            where: {
                name: userIndex
            }
        });
    }

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
            displayName: publicActor.name
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