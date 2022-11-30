import { type NextApiRequest, type NextApiResponse } from "next";

const user = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    "help": "help"
  });
};

export default user;
