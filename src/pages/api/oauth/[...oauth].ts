import { type NextApiRequest, type NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import generateProvider from "server/oauth";


const oauth = async (req: NextApiRequest, res: NextApiResponse) => {
    await NextCors(req, res, {
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        origin: "*",
        optionsSuccessStatus: 200
    });
    await (await generateProvider()).callback()(req, res);
};

export default oauth;
