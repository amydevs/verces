import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { env } from "env/server.mjs";
import { type IActor } from "server/activitypub/type";
import { getFollowersUri, getInboxUri, getOutboxUri, getUserUri } from "lib/uris";

const generateActor = (name: string, pubKey: string): IActor => {
  const userUri = getUserUri(name);
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],

    'id': userUri,
    'attributedTo': userUri,
    'type': 'Person',
    'preferredUsername': name,
    'inbox': getInboxUri(name),
    'outbox': getOutboxUri(name),
    'followers': getFollowersUri(name),

    'publicKey': {
      'id': `${userUri}#main-key`,
      'owner': userUri,
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
      name: id
    }
  });
  if (!foundUser?.keyPair?.publicKey || !foundUser?.name) {
    return res.status(404).send('Not Found')
  }
  
  return res.status(200).json(generateActor(foundUser.name, foundUser.keyPair?.publicKey));
};

export default user;
