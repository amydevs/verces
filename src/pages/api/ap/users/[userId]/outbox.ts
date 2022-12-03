import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { IOrderedCollectionPage, type ApObject, type IOrderedCollection } from "server/activitypub/type";
import { Prisma, Visibility } from "@prisma/client";
import { env } from "env/server.mjs";
import { generateCreate } from "server/activitypub/streams/create";
import { generateNote, statusInclude } from "server/activitypub/streams/note";

const outbox = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, page, min_id, max_id } = req.query;
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

    const actorUrl = `https://${env.HOST}/users/${foundUser.name}`;
    const outboxUrl = `${actorUrl}/outbox`
    const streamsContextUrl = "https://www.w3.org/ns/activitystreams";

    if (typeof page === 'string' && page.toLowerCase() === 'true' ) {
        
        let page_options = Prisma.validator<Prisma.StatusFindManyArgs>()({});
          
        if (typeof min_id === 'string') {
            // implement last page later
            page_options = {
                cursor: {
                    id: min_id
                },
                take: -1 -objPerPage,
            }
        }
        else if (typeof max_id === 'string') {
            page_options = {
                cursor: {
                    id: max_id
                },
                skip: 1,
                take: objPerPage
            }
        }
        else {
            page_options = {
                take: objPerPage
            }
        }
        const statuses = await prisma.status.findMany({
            ...statusInclude,
            where: {
                user: {
                    id: foundUser.id,
                },
            },
            ...page_options
        })
        if (statuses.length > objPerPage) {
            statuses.length = objPerPage
        }
        
        const creates = statuses.map(e => generateCreate(foundUser.name, env.HOST, generateNote(foundUser.name, env.HOST, e)))
        const outbox: IOrderedCollectionPage = {
            "@context": streamsContextUrl,
            type: 'OrderedCollectionPage',
            orderedItems: creates,
            next: `${outboxUrl}?page=true&max_id=${statuses[statuses.length - 1]?.id || 0}`,
            prev: `${outboxUrl}?page=true&min_id=${statuses[0]?.id || 0}`,
            attributedTo: actorUrl
        }
        return res.json(outbox);
    }
    else {
        const count = await prisma.status.count({
            where: {
                user: {
                    id: foundUser.id,
                },
                ...whereVisibility.where.visibility
            }
        })
        return res.json({
            "@context": streamsContextUrl,
            "type": "OrderedCollection",
            "totalItems": count,
            "first": `${outboxUrl}?page=true`,
            "last": `${outboxUrl}?page=true`,
            "attributedTo": actorUrl
        });
    }
};

export default outbox;
