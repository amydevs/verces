import type { NextApiRequest, NextApiResponse } from "next";
import generateProvider from "server/oauth";

const interactionLogin = async (req: NextApiRequest, res: NextApiResponse) => {
    const provider = await generateProvider();
    const details = await provider.interactionDetails(req, res);
    
    res.status(200).json({});
};

export default interactionLogin;