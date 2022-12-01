import { type NextApiRequest, type NextApiResponse } from "next";

const outbox = async (req: NextApiRequest, res: NextApiResponse) => {
    res.send("WIP")
};

export default outbox;
