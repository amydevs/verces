import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "../../../../server/db/client";
import { env } from "../../../../env/server.mjs";

const createWebfinger = (name: string, domain: string) => {
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
    console.log(env.HOST);
    let reference = req.query.reference;
    if (typeof reference !== 'string') {
        return res.status(400).send('Bad Response')
    }

    const acct = 'acct:';
    if (reference.startsWith(acct)) {
        reference = reference.substring(acct.length)
    }
    const lastIndexOfAt = reference.lastIndexOf('@');
    if (lastIndexOfAt !== -1) {
        reference = reference.substring(0, lastIndexOfAt);
    }

    const foundWebFinger = await prisma.user.findFirst({ where: { name: reference } });
    if (!foundWebFinger) {
        return res.status(404).send('Not Found')
    }

    return res.status(200).json(createWebfinger(reference, env.HOST));
};
  
export default webfinger;