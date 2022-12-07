import { signatureGuard } from "lib/guard";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";

const userInbox = signatureGuard(async (req: NextApiRequest, res: NextApiResponse) => {
    if (typeof req.body !== "object") {
        req.body = JSON.parse(req.body);
    }
    const parsed = await compact(req.body);

    console.log(parsed);
    return res.status(202).send(202);
});

export default userInbox;
