import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
    await prisma.user.create({
        data: {
            name: "help",
            host: "help.com"
        }
    })
    await prisma.user.create({
        data: {
            name: "help",
        }
    })
    await prisma.user.create({
        data: {
            name: "hel1p",
            host: "help.com"
        }
    })
    await prisma.user.create({
        data: {
            name: "help",
        }
    })
    res.send('help')
};

export default examples;
