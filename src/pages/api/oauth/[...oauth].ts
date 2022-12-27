import { type NextApiRequest, type NextApiResponse } from "next";
import provider from "server/oauth";


const oauth = async (req: NextApiRequest, res: NextApiResponse) => {
    await provider.callback()(req, res);
};

export default oauth;
