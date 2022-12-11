import { Prisma, PrismaClient, User } from "@prisma/client";
import { IActor } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { getIndexUri, getUserStatusFromUri } from "lib/uris";

export default class UserModel {
    constructor(private readonly prismaUser: PrismaClient["user"]) {}

    createFromActor = async (actor: IActor | string) => {
        const actorId = typeof actor === "string" ? actor : actor.id;
        if (actorId?.startsWith(getIndexUri())) {
            const { userIndex } = getUserStatusFromUri(actorId);
            return this.prismaUser.findFirstOrThrow({
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
            }
        };
    
    
        const tempDbActor = await this.prismaUser.upsert({
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
}
