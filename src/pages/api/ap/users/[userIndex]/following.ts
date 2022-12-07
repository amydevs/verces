import { FollowType, Prisma } from "@prisma/client";
import { ActivityStreamsContext } from "lib/activities/contexts";
import { IOrderedCollectionPage } from "lib/activities/type";
import { sendResError } from "lib/errors";
import { getFollowersUri, getUserUri } from "lib/uris";
import { type NextApiRequest, type NextApiResponse } from "next";
import {prisma} from "server/db/client";

const following = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userIndex, page } = req.query ;
    const objPerPage = 12;

    if (typeof userIndex !== "string") {
        return sendResError(res, 400);
    }
    const followersUri = getFollowersUri(userIndex);

    const wherePublicFollows = {
        where: {
            user: {
                name: userIndex
            },
            type: FollowType.Accepted
        },
    };

    if (!page) {
        const count = await prisma.follow.count({
            ...wherePublicFollows
        });
        return res.json({
            "@context": ActivityStreamsContext,
            "id": followersUri,
            "type": "OrderedCollection",
            "totalItems": count,
            "first": `${followersUri}?page=1`
        });
    }

    let pageNum = Number(page);
    if (isNaN(pageNum) || pageNum < 1) {
        pageNum = 1;
    }
    
    const follows = await prisma.follow.findMany({
        ...wherePublicFollows,
        include: {
            targetUser: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            updatedAt: "desc",
        },
        take: objPerPage,
        skip: (pageNum - 1) * objPerPage
    });
    
    return res.json({
        "@context": ActivityStreamsContext,
        id: `${getFollowersUri(userIndex)}?page=${pageNum}`,
        type: "OrderedCollectionPage",
        orderedItems: follows.map(e => getUserUri(e.targetUser.name)),
        partOf: getFollowersUri(userIndex),
        next: `${getFollowersUri(userIndex)}?page=${pageNum + 1}`,
    } as IOrderedCollectionPage);
};

export default following;
