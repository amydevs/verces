import type { ApObject, IActor, IObject } from "./type";
import { getApObjectBody } from "./utils";
import { prisma } from "server/db/client";
import { getIndexUri, getUserStatusFromUri } from "lib/uris";
import { Prisma } from "@prisma/client";

export const userFromActor = async (actor: IActor | string) => {
    const publicActor = await getApObjectBody(actor) as IActor;

    const updateData = {
        data: {
            name: `${publicActor.preferredUsername}`,
            host: new URL(`${publicActor.id}`).host,
            ...(publicActor.publicKey ? {
                keyPair: {
                    create: {
                        publicKey: publicActor.publicKey.publicKeyPem
                    }
                }
            } : {}),
            uri: publicActor.id,
            url: publicActor.url?.toString(),
        }
    };

    return prisma.$transaction(async (prisma) => {
        let tempDbActor = undefined;
        try {
            tempDbActor = await prisma.user.update({
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
            tempDbActor = await prisma.user.findFirst({
                where: {
                    uri: typeof actor === "string" ? actor : actor.id
                }
            });
        }

        
        return tempDbActor ?? 
        await (async () => {
            return prisma.user.create({
                ...updateData
            });
        })();
    });
};