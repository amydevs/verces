import { type NextApiRequest, type NextApiResponse } from "next";
import generateProvider from "server/oauth";


const oauth = async (req: NextApiRequest, res: NextApiResponse) => {
    await (await generateProvider()).callback()(req, res);
};

export default oauth;
