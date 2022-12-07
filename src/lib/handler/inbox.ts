import { statusFromNote } from "lib/activities/note";
import type { IObject } from "lib/activities/type";
import { isCreate, isPost, isUpdate } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { compact } from "lib/jsonld";
import type { NextApiRequest, NextApiResponse } from "next";

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
    return res.status(202).send(202);
};