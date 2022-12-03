import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { type IActor } from "lib/activities/type";
import { getFollowersUri, getFollowingUri, getInboxUri, getOutboxUri, getUserUri, getUserUrl } from "lib/uris";
import { ActorContext } from "lib/activities/contexts";
import { sendResError } from "lib/errors";
import type { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/ban-types
const generateActor = (user: Prisma.UserGetPayload<{}>, privateKey: string): IActor => {
    const { name, displayName } = user;
    const userUri = getUserUri(name);
    return {
        "@context": ActorContext,

        "id": userUri,
        "type": "Person",
        "preferredUsername": name,
        ...(displayName ? { "name": displayName } : {}),
        "inbox": getInboxUri(name),
        "outbox": getOutboxUri(name),
        "followers": getFollowersUri(name),
        "following": getFollowingUri(name),
        "url": getUserUrl(name),
        "publicKey": {
            "id": `${userUri}#main-key`,
            "owner": userUri,
            "publicKeyPem": privateKey
        },
        "endpoints": {
            "sharedInbox": getInboxUri()
        }
    };
};

const user = async (req: NextApiRequest, res: NextApiResponse) => {
    const id = req.query.userId;
    if (typeof id !== "string") {
        return sendResError(res, 400);
    }
    const foundUser = await prisma.user.findFirst({
        include: {
            keyPair: true,
        },
        where: {
            name: id
        }
    });
    if (!foundUser?.keyPair?.publicKey || !foundUser?.name) {
        return sendResError(res, 404);
    }
  
    return res.status(200).json(generateActor(foundUser, foundUser.keyPair.privateKey));
};

export default user;
