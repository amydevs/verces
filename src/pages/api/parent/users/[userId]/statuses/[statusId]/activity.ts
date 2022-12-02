import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { generateCreate } from "server/activitypub/streams/create";
import { generateNote, statusInclude } from "server/activitypub/streams/note";
import { prisma } from "server/db/client";

const status = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, statusId } = req.query;
    if (typeof userId !== 'string' || typeof statusId !== 'string') {
        return res.status(400).send('Bad Request')
    }
    const foundStatus = await prisma.status.findFirst({
        include: {
            user: true,
            ...statusInclude.include
        },
        where: {
            user: {
                name: userId
            },
            id: statusId
        }
    });
    if (!foundStatus) {
        return res.status(404).send('Not Found')
    }
    return res.json(generateCreate(foundStatus.user.name, env.HOST, generateNote(foundStatus.user.name, env.HOST, foundStatus)));
};

export default status;
