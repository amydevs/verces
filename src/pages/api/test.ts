const message = {};

import { compact } from "lib/jsonld";
import { type NextApiRequest, type NextApiResponse } from "next";


const examples = async (req: NextApiRequest, res: NextApiResponse) => {
    const compacted = await compact(message);
    res.send(compacted);
};

export default examples;
