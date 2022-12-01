import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type IObject } from "server/activitypub/type";
import { prisma } from "server/db/client";

const status = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, statusId } = req.query;
    if (typeof userId !== 'string' || typeof statusId !== 'string') {
        return res.status(400).send('Bad Request')
    }
    const foundStatus = await prisma.status.findFirst({
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
    const note: IObject = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': `https://${env.HOST}/users/${userId}/statuses${statusId}`,
        'type': 'Note',
        'published': foundStatus.createdAt.toISOString(),
        'attributedTo': `https://${env.HOST}/users/${userId}`,
        'content': foundStatus.text,
        'to': [
            'https://www.w3.org/ns/activitystreams#Public'
        ]
    }
};

export default status;
