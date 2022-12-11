import { type NextApiRequest, type NextApiResponse } from "next";

const nodeInfo = async (_req: NextApiRequest, res: NextApiResponse) => {
    return res.json({
        version: "2.0",
        software: {
            name: "verces",
            version: "0.1.0"
        },
        protocols: [
            "activitypub"
        ],
        usage: {
            users: {
                total: 1,
                activeMonth: 1,
                activeHalfyear: 1
            },
            localPosts: 1
        },
        openRegistrations: false
    });
};

export default nodeInfo;
