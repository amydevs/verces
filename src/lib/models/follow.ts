import { PrismaClient, Visibility } from "@prisma/client";
import { userFromActor } from "lib/activities/actor";
import { IFollow, IObject, isActor } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { getFollowersUri, getIndexUri, getUserStatusFromUri, PublicStream } from "lib/uris";

export default class FollowModel {
    constructor(private readonly prismaFollow: PrismaClient["follow"]) {}
    fromFollow = async (follow: IFollow | string) => {
        const gotFollow = getApObjectBody(follow) as unknown as IFollow;
        const targetActorUri = typeof gotFollow.actor === "string" ? gotFollow.actor : gotFollow.actor.id;
        if (targetActorUri?.startsWith(getIndexUri())) {
            const body = await getApObjectBody(gotFollow.object) as IObject;
            if (isActor(body)) {
                const fromUser = await userFromActor(body);
                const { userIndex } = getUserStatusFromUri(targetActorUri);
                return await this.prismaFollow.create({
                    data: {
                        type: "Accepted",
                        targetUser: {
                            connect: {
                                name: userIndex
                            }
                        },
                        user: {
                            connect: {
                                id: fromUser.id
                            }
                        }
                    }
                });
            }
        }
        throw new Error("Target user is not a user that is in this instance.");
    };
}