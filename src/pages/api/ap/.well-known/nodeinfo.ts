import { type NextApiRequest, type NextApiResponse } from "next";
import { getNodeInfoUri } from "../../../../lib/uris";

const nodeInfoWellKnown = async (req: NextApiRequest, res: NextApiResponse) => {
    return res.json({
        links: [
            {
                rel: "http://nodeinfo.diaspora.software/ns/schema/2.0",
                href: getNodeInfoUri()
            }
        ]
    });
};

export default nodeInfoWellKnown;
