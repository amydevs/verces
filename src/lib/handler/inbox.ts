import { userFromActor } from "lib/activities/actor";
import { statusFromNote } from "lib/activities/note";
import { IActor, IObject, isActor, isFollow } from "lib/activities/type";
import { isCreate, isPost, isUpdate } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { compact } from "lib/jsonld";
import { getIndexUri, getUserStatusFromUri } from "lib/uris";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "server/db/client";

export const inboxHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (typeof req.body !== "object") {
        req.body = JSON.parse(req.body);
    }
    const parsed = (await compact(req.body)) as unknown as IObject;
    
    if (isCreate(parsed) || isUpdate(parsed)) {
        const body = await getApObjectBody(parsed.object);
        if (!Array.isArray(body) && isPost(body)) {
            await statusFromNote(body);
        }
    }
    else if (isFollow(parsed)) {
        const targetActorUri = typeof parsed.actor === "string" ? parsed.actor : parsed.actor.id;
        if (targetActorUri?.startsWith(getIndexUri())) {
            const body = await getApObjectBody(parsed.object) as IObject;
            if (isActor(body)) {
                const fromUser = await userFromActor(body);
                const { userIndex } = getUserStatusFromUri(targetActorUri);
                await prisma.follow.create({
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
    }
    return res.status(202).send(202);
};