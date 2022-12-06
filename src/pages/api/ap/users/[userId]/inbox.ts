import { signatureGuard } from "lib/guard";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";

const userInbox = signatureGuard(async (req: NextApiRequest, res: NextApiResponse) => {
    const parsed = await compact(JSON.parse(req.body));
    res.send(JSON.stringify(parsed));
});

export default userInbox;
