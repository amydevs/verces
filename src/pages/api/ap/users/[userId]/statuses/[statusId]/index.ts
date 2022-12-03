import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { generateNote, statusInclude } from "lib/activities/note";
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
    return res.json(generateNote(foundStatus.user.name, foundStatus));
};

export default status;
