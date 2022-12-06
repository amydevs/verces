import { type IObject, isCreate, isPost } from "lib/activities/type";
import { getApObjectBody } from "lib/activities/utils";
import { sendResError } from "lib/errors";
import { signatureGuard } from "lib/guard";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";

const inbox = signatureGuard(async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.body) {
        return sendResError(res, 400);
    }
    const parsed = (await compact(req.body)) as unknown as IObject;
    console.log(parsed);
    
    if (isCreate(parsed)) {
        const body = await getApObjectBody(parsed.object);
        if (!Array.isArray(body) && isPost(body)) {
            
        }
    }

    res.json(parsed);
});

export default inbox;
