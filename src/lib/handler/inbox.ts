import { IActor, IObject, isActor, isAnnounce, isFollow } from "lib/activities/type";
import { isCreate, isPost, isUpdate } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { sendResError } from "lib/errors";
import { compact } from "lib/jsonld";
import FollowModel from "lib/models/follow";
import StatusModel from "lib/models/status";
import { getIndexUri, getUserStatusFromUri } from "lib/uris";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "server/db/client";

export const inboxHandler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (typeof req.body !== "object") {
        req.body = JSON.parse(req.body);
    }
    const parsed = (await compact(req.body)) as unknown as IObject;
    
    console.log(parsed.type);

    if (isFollow(parsed)) {
        await new FollowModel(prisma.follow).fromFollow(parsed);
    }
    else if (isCreate(parsed) || isUpdate(parsed)) {
        const body = await getApObjectBody(parsed.object);
        if (!Array.isArray(body) && isPost(body)) {
            await new StatusModel(prisma.status).createFromNote(body);
        }
    }
    else if (isAnnounce(parsed)) {
        const body = await getApObjectBody(parsed.object);
        if (!Array.isArray(body) && isPost(body)) {
            await new StatusModel(prisma.status).createFromNote(body);
        }
    }
    
    return res.status(202).send(202);
};