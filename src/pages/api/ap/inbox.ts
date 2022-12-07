import { statusFromNote } from "lib/activities/note";
import { type IObject, isCreate, isPost, isUpdate } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { sendResError } from "lib/errors";
import { signatureGuard } from "lib/guard";
import { inboxHandler } from "lib/handler/inbox";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";

const inbox = signatureGuard(async (req: NextApiRequest, res: NextApiResponse) => {
    return inboxHandler(req, res);
});

export default inbox;
