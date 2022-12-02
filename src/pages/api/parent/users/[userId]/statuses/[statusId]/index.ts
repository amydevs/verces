import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { generateNoteWithReply } from "server/activitypub/streams/note";
import { prisma } from "server/db/client";

const status = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, statusId } = req.query;
    if (typeof userId !== 'string' || typeof statusId !== 'string') {
        return res.status(400).send('Bad Request')
    }
    const foundStatus = await prisma.status.findFirst({
        include: {
            replyingTo: {
                include: {
                    replyingToStatus: true,
                    replyingToUser: true
                }
            }
        },
        where: {
            user: {
                OR: {
                    id: userId,
                    name: userId
                }
            },
            id: statusId
        }
    });
    if (!foundStatus) {
        return res.status(404).send('Not Found')
    }
    return generateNoteWithReply(userId, env.HOST, foundStatus);
};

export default status;
