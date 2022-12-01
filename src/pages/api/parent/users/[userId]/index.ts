import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { env } from "env/server.mjs";
import { type IActor } from "server/activitypub/type";

const createActor = (name: string, domain: string, pubKey: string): IActor => {
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],

    'id': `https://${domain}/users/${name}`,
    'type': 'Person',
    'preferredUsername': `${name}`,
    'inbox': `https://${domain}/users/${name}/inbox`,
    'outbox': `https://${domain}/users/${name}/outbox`,
    'followers': `https://${domain}/users/${name}/followers`,

    'publicKey': {
      'id': `https://${domain}/users/${name}#main-key`,
      'owner': `https://${domain}/users/${name}`,
      'publicKeyPem': pubKey
    }
  };
}

const user = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.userId;
  if (typeof id !== 'string') {
    return res.status(400).send('Bad Request')
  }
  const foundUser = await prisma.user.findFirst({
    select: {
      keyPair: true,
      name: true
    },
    where: {
      OR: {
        id,
        name: id
      }
    }
  });
  if (!foundUser?.keyPair?.publicKey || !foundUser?.name) {
    return res.status(404).send('Not Found')
  }
  
  return res.status(200).json(createActor(foundUser.name, env.HOST,foundUser.keyPair?.publicKey));
};

export default user;
