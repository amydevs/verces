import type { PrismaClient} from "@prisma/client";
import { Visibility } from "@prisma/client";
import UserModel from "./user";
import type { IAccept, IActor, IFollow} from "lib/activities/type";
import { IObject, isActor } from "lib/activities/type";
import { generatePostHeaders, getApObjectBody } from "lib/activities/utils";
import { getFollowersUri, getIndexUri, getUserStatusFromUri, getUserUri, PublicStream } from "lib/uris";
import { prisma } from "server/db/client";
import { ActivityStreamsContext } from "lib/activities/contexts";

export default class FollowModel {
    constructor(private readonly prismaFollow: PrismaClient["follow"]) {}
    createFromFollow = async (follow: IFollow | string) => {
        const gotFollow = getApObjectBody(follow) as unknown as IFollow;
        const targetActorUri = typeof gotFollow.actor === "string" ? gotFollow.actor : gotFollow.actor.id;
        if (targetActorUri?.startsWith(getIndexUri())) {
            const body = await getApObjectBody(gotFollow.object) as IActor;
            if (isActor(body)) {
                const fromUser = await new UserModel(prisma.user).createFromActor(body);
                const { userIndex } = getUserStatusFromUri(targetActorUri);
                const follow = await this.prismaFollow.create({
                    include: {
                        targetUser: {
                            include: {
                                keyPair: true
                            }
                        },
                        user: true,
                    },
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
                const acceptFollowRequest: IAccept = {
                    "@context": ActivityStreamsContext,
                    id: new URL(follow.id, getIndexUri()).toString(),
                    type: "Accept",
                    actor: getUserUri(`${userIndex}`),
                    object: gotFollow
                };
                const message = JSON.stringify(acceptFollowRequest);
                console.log(
                    await fetch(body.inbox, {
                        method: "POST",
                        headers: generatePostHeaders(message, follow.targetUser.name, follow.targetUser.keyPair?.privateKey as string, body.inbox),
                        body: message,
                    }).then(e => e.text())
                );
                return follow;
            }
        }
        throw new Error("Target user is not a user that is in this instance.");
    };
}