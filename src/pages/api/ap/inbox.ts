import { type IObject, isCreate } from "lib/activities/type";
import { sendResError } from "lib/errors";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";

const inbox = async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.body) {
        return sendResError(res, 400);
    }
    const parsed = (await compact(req.body)) as unknown as IObject;
    
    if (isCreate(parsed)) {
        if (typeof parsed.object === "object") {
            if (parsed.object.type === "Note") {
                
            } 
        }
    }

    res.json(parsed);
};

export default inbox;
