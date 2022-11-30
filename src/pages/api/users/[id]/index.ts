import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";

const user = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id;
  if (typeof id !== 'string') {
    return res.status(400).send('Bad Request')
  }
  const foundUserActor = await prisma.user.findFirst({
    select: {
      actor: true
    },
    where: {
      OR: {
        id,
        name: id
      }
    }
  });
  if (!foundUserActor) {
    return res.status(400).send('Not Found')
  }
  return res.status(200).json(foundUserActor.actor);
};

export default user;
