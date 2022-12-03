import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { type IOrderedCollectionPage } from "server/activitypub/type";
import { Prisma, Visibility } from "@prisma/client";
import { env } from "env/server.mjs";
import { generateCreate } from "server/activitypub/streams/create";
import { generateNote, statusInclude } from "server/activitypub/streams/note";
import { getOutboxUri, getUserUri } from "lib/uris";

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

    const actorUrl = getUserUri(foundUser.name);
    const outboxUrl = getOutboxUri(foundUser.name);
    const streamsContextUrl = "https://www.w3.org/ns/activitystreams";
    const publicVisibilities = [
        Visibility.Public,
        Visibility.Unlisted
    ]

    if (typeof page === 'string' && page.toLowerCase() === 'true' ) {
        
        let page_options = Prisma.validator<Prisma.StatusFindManyArgs>()({});
        
        if (typeof min_id === 'string') {
            if (min_id === '0') {   
                page_options = {
                    orderBy: {
                        createdAt: 'asc'
                    },
                } satisfies Prisma.StatusFindManyArgs;
            }
            else {
                page_options = {
                    cursor: {
                        id: min_id
                    },
                    take: -1 -objPerPage,
                } satisfies Prisma.StatusFindManyArgs;
            }
        }
        else if (typeof max_id === 'string') {
            page_options = {
                cursor: {
                    id: max_id
                },
                skip: 1,
            } satisfies Prisma.StatusFindManyArgs;
        }

        const statuses = await prisma.status.findMany({
            where: {
                user: {
                    id: foundUser.id,
                },
                visibility: {
                    in: publicVisibilities
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: objPerPage,
            ...statusInclude,
            ...page_options
        })
        if (min_id === '0') {
            // the array is reversed when getting the last page of posts... so let's reverse it back!
            statuses.reverse()
        }
        if (statuses.length > objPerPage) {
            // this will happen when using min_id
            statuses.length = objPerPage
        }
        
        const creates = statuses.map(e => generateCreate(foundUser.name, env.HOST, generateNote(foundUser.name, env.HOST, e)))
        const outbox: IOrderedCollectionPage = {
            "@context": streamsContextUrl,
            type: 'OrderedCollectionPage',
            orderedItems: creates,
            partOf: outboxUrl,
            attributedTo: actorUrl
        }
        if (creates.length !== 0) {
            outbox.next = `${outboxUrl}?page=true&max_id=${statuses[statuses.length - 1]?.id || 0}`;
            outbox.prev = `${outboxUrl}?page=true&min_id=${statuses[0]?.id || 0}`;
        }

        return res.json(outbox);
    }
    else {
        const count = await prisma.status.count({
            where: {
                user: {
                    id: foundUser.id,
                },
                visibility: {
                    in: publicVisibilities
                }
            }
        })
        return res.json({
            "@context": streamsContextUrl,
            "type": "OrderedCollection",
            "totalItems": count,
            "first": `${outboxUrl}?page=true`,
            "last": `${outboxUrl}?page=true&min_id=0`,
            "attributedTo": actorUrl
        });
    }
};

export default outbox;
