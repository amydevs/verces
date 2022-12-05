import type { ApObject, IActor, IObject } from "./type";
import { getApObjectBody } from "./utils";
import { prisma } from "server/db/client";
import { getIndexUri, getUserStatusFromUri } from "lib/uris";

export const userFromActor = async (actor: IActor | string) => {
    const publicActor = await getApObjectBody(actor) as IActor;

    let tempDbActor = undefined;
    try {
        tempDbActor = await prisma.user.update({
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

    const dbActor = 
        tempDbActor ?? 
        await (async () => {
            return prisma.user.create({
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
            });
        })();
    return dbActor;
};

export const userFromUri = async (uri: string) => {
    // add cache refreshing later and more local user stuff
    if (uri.startsWith(getIndexUri()))  {
        const { userIndex } = getUserStatusFromUri(uri);
        return prisma.user.findFirstOrThrow({
            where: {
                name: userIndex
            }
        });
    }
    const dbActor = 
        await prisma.user.findFirst({
            where: {
                uri: uri,
            },
        }) ?? 
        await (async () => {
            const publicActor = await getApObjectBody(uri) as IActor;
            return prisma.user.create({
                data: {
                    name: `${publicActor.preferredUsername}`,
                    host: new URL(uri).host,
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
            });
        })();
    return dbActor;
};