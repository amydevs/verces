import { signatureGuard } from "lib/guard";
import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";

const userInbox = signatureGuard(async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.body);
    // const parsed = await compact(JSON.parse(req.body));
    // console.log(parsed);
    // res.send(JSON.stringify(parsed));
    res.send("");
});

export default userInbox;
