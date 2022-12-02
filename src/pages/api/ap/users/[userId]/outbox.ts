import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { type ApObject, type IOrderedCollection } from "server/activitypub/type";
import { Visibility } from "@prisma/client";
import { env } from "env/server.mjs";
import { generateCreate } from "server/activitypub/streams/create";
import { generateNote, statusInclude } from "server/activitypub/streams/note";

const outbox = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, page, min_id } = req.query;
    const objPerPage = 20;

    if (typeof userId !== 'string') {
        return res.status(400).send('Bad Request')
    }
    const foundUser = await prisma.user.findFirst({
        select: {
            id: true,
            keyPair: true,
            name: true
        },
        where: {
            name: userId
        }
    });
    if (!foundUser?.keyPair?.publicKey || !foundUser?.name) {
        return res.status(404).send('Not Found')
    }
    
    const whereVisibility = {
        where: {
            user: {
                id: foundUser.id,
            },
            visibility: {
                in: [
                    Visibility.Public,
                    Visibility.Unlisted
                ]
            }
        }
    }

    const outboxUrl = `https://${env.HOST}/users/${foundUser.name}/outbox`
    const streamsContextUrl = "https://www.w3.org/ns/activitystreams";

    const count = await prisma.status.count({
        where: {
            user: {
                id: foundUser.id,
            },
            ...whereVisibility.where.visibility
        }
    })
    const outboxBase = {
        "@context": streamsContextUrl,
        "type": "OrderedCollection",
        "totalItems": count,
    }

    if (typeof page === 'string' && page.toLowerCase() === 'true' ) {
        const statuses = await prisma.status.findMany({
            ...statusInclude,
            where: {
                user: {
                    id: foundUser.id,
                },
                ...whereVisibility.where.visibility,
            },
            take: objPerPage + 1,
            ...(typeof min_id === 'string' ? 
                {
                    cursor: {
                        id: min_id
                    }
                } : {}
            )
        })
        const lastStatus = statuses[objPerPage+1] ? statuses.pop() : undefined;
        const creates = statuses.map(e => generateCreate(foundUser.name, env.HOST, generateNote(foundUser.name, env.HOST, e)))
        const outbox: { orderedItems: ApObject } = {
            ...outboxBase,
            orderedItems: creates,
            "next": `${outboxUrl}?page=true&min_id=${lastStatus?.id || 0}`
        }
    }
    else {
        const outbox = {
            ...outboxBase,
            "first": `${outboxUrl}?page=true`,
            "last": `${outboxUrl}?page=true`
        }
        return res.send(outbox);
    }
};

export default outbox;
