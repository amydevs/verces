import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { type IOrderedCollectionPage } from "lib/activities/type";
import { Prisma, Visibility } from "@prisma/client";
import { getOutboxUri } from "lib/uris";
import { ActivityStreamsContext, StatusContext } from "lib/activities/contexts";
import { sendResError } from "lib/errors";
import { generateCreateFromNote, generateNoteFromStatus, StatusInclude } from "lib/models/status";

const outbox = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userIndex, page, min_id, max_id } = req.query;
    const objPerPage = 20;

    if (typeof userIndex !== "string") {
        return sendResError(res, 400);
    }
    const foundUser = await prisma.user.findFirst({
        select: {
            id: true,
            keyPair: true,
            name: true
        },
        where: {
            name: userIndex
        }
    });
    if (!foundUser?.keyPair?.publicKey || !foundUser?.name) {
        return sendResError(res, 404);
    }

    const outboxUrl = getOutboxUri(foundUser.name);
    const publicVisibilities = [
        Visibility.Public,
        Visibility.Unlisted
    ];

    if (typeof page === "string" && page.toLowerCase() === "true" ) {
        
        let page_options = Prisma.validator<Prisma.StatusFindManyArgs>()({});
        
        if (typeof min_id === "string") {
            if (min_id === "0") {   
                page_options = {
                    orderBy: {
                        createdAt: "asc"
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
        else if (typeof max_id === "string") {
            page_options = {
                cursor: {
                    id: max_id
                },
                skip: 1,
            } satisfies Prisma.StatusFindManyArgs;
        }

        const statuses = await prisma.status.findMany({
            where: {
                OR: [
                    {
                        user: {
                            id: foundUser.id,
                        },
                        visibility: {
                            in: publicVisibilities
                        }
                    },
                    {
                        restatuses: {
                            some: {
                                userId: foundUser.id,
                                status: {
                                    visibility: {
                                        in: publicVisibilities
                                    }
                                }
                            },
                        }
                    }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            take: objPerPage,
            ...StatusInclude,
            ...page_options
        });
        if (min_id === "0") {
            // the array is reversed when getting the last page of posts... so let's reverse it back!
            statuses.reverse();
        }
        if (statuses.length > objPerPage) {
            // this will happen when using min_id
            statuses.length = objPerPage;
        }
        
        const creates = statuses.map(e => generateCreateFromNote(generateNoteFromStatus(e, false)));
        const outbox: IOrderedCollectionPage = {
            "@context": StatusContext,
            type: "OrderedCollectionPage",
            orderedItems: creates,
            partOf: outboxUrl,
        };
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
        });
        return res.json({
            "@context": ActivityStreamsContext,
            "type": "OrderedCollection",
            "totalItems": count,
            "first": `${outboxUrl}?page=true`,
            "last": `${outboxUrl}?page=true&min_id=0`,
        });
    }
};

export default outbox;
