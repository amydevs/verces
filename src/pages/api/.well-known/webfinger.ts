import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../server/db/client";

const webfinger = async (req: NextApiRequest, res: NextApiResponse) => {
    let reference = req.query.reference;
    if (typeof reference !== 'string') {
        return res.status(400).send('Bad Response')
    }

    const acct = 'acct:';
    if (reference.startsWith(acct)) {
        reference = reference.substring(acct.length)
    }
    const lastIndexOfAt = reference.lastIndexOf('@');
    if (lastIndexOfAt !== -1) {
        reference = reference.substring(0, lastIndexOfAt);
    }

    const foundWebFinger = await prisma.user.findFirst({ where: { name: reference } });
    if (!foundWebFinger) {
        return res.status(400).send('Not Found')
    }

    return res.status(200).json(foundWebFinger.webfinger);
};
  
export default webfinger;