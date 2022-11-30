import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";

const inbox = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed')
  }
  res.status(200).json({
    "help": "inbox"
  });
  env.HOST
};

export default inbox;
