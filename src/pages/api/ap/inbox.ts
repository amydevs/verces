import { statusFromNote } from "lib/activities/note";
import { type IObject, isCreate, isPost } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { sendResError } from "lib/errors";
import { signatureGuard } from "lib/guard";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";

const inbox = signatureGuard(async (req: NextApiRequest, res: NextApiResponse) => {
    if (typeof req.body !== "object") {
        req.body = JSON.parse(req.body);
    }
    const parsed = (await compact(req.body)) as unknown as IObject;
    
    if (isCreate(parsed)) {
        const body = await getApObjectBody(parsed.object);
        if (!Array.isArray(body) && isPost(body)) {
            prisma.$transaction(async (prisma) => {
                await statusFromNote(body, prisma);
            });
        }
    }
    return res.send("");
});

export default inbox;
