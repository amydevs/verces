import { type NextApiRequest, type NextApiResponse } from "next";

const inbox = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    "help": "inbox"
  });
};

export default inbox;
