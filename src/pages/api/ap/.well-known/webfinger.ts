import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { env } from "../../../../env/server.mjs";

const generateWebfinger = (name: string, domain: string) => {
    return {
        'subject': `acct:${name}@${domain}`,
    
        'links': [
            {
            'rel': 'self',
            'type': 'application/activity+json',
            'href': `https://${domain}/users/${name}`
            }
        ]
    };
}

const webfinger = async (req: NextApiRequest, res: NextApiResponse) => {
    let reference = req.query.resource;
    if (typeof reference !== 'string') {
        return res.status(400).send('Bad Response')
    }

    const acct = 'acct:';
    if (reference.startsWith(acct)) {
        reference = reference.substring(acct.length)
    }
    const [username, host] = reference.split("@", 1);
    if (host !== env.HOST) {
        return res.status(404).send('Not Found')
    }

    const foundWebFinger = await prisma.user.findFirst({ where: { name: username, host: "" } });
    if (!foundWebFinger) {
        return res.status(404).send('Not Found')
    }

    return res.status(200).json(generateWebfinger(reference, env.HOST));
};
  
export default webfinger;