import { type NextApiRequest, type NextApiResponse } from "next";

import { prisma } from "../../server/db/client";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
  await prisma.user.create({
    data: {
        name: "help",
    }
  })
  return await prisma.user.create({
    data: {
        name: "help",
        host: "help.com"
    }
  })
};

export default examples;
