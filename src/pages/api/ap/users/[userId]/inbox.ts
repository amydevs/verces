import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";

const inbox = async (req: NextApiRequest, res: NextApiResponse) => {
    const parsed = await compact(JSON.parse(req.body));
    res.send(JSON.stringify(parsed));
};

export default inbox;
