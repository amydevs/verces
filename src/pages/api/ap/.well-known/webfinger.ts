import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { env } from "../../../../env/server.mjs";
import { sendResError } from '../../../../lib/errors';
import { getUserUri } from '../../../../lib/uris';

const generateWebfinger = (name: string, domain: string) => {
    return {
        'subject': `acct:${name}@${domain}`,
    
        'links': [
            {
                'rel': 'self',
                'type': 'application/activity+json',
                'href': getUserUri(name)
            }
        ]
    };
}

const webfinger = async (req: NextApiRequest, res: NextApiResponse) => {
    let reference = req.query.resource;
    if (typeof reference !== 'string') {
        return sendResError(res, 400)
    }

    const acct = 'acct:';
    if (reference.startsWith(acct)) {
        reference = reference.substring(acct.length)
    }

    const [username, host] = reference.split("@", 2);
    if (host && host !== env.HOST) {
        return sendResError(res, 404)
    }

    const foundWebFinger = await prisma.user.findFirst({ where: { name: username, host: "" } });
    if (!foundWebFinger) {
        return sendResError(res, 404)
    }

    return res.status(200).json(generateWebfinger(reference, env.HOST));
};
  
export default webfinger;