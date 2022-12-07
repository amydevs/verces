import { statusFromNote } from "lib/activities/note";
import type { IObject } from "lib/activities/type";
import { isCreate, isPost, isUpdate } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { signatureGuard } from "lib/guard";
import { inboxHandler } from "lib/handler/inbox";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";

const userInbox = signatureGuard(async (req: NextApiRequest, res: NextApiResponse) => {
    return inboxHandler(req, res);

});

export default userInbox;
