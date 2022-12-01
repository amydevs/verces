import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "server/common/get-server-auth-session";

import { prisma } from "../../server/db/client";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerAuthSession({ req, res });
    const activityContentType = 'application/activity+json';

    
    if (session?.user?.id) {
        const gotUser = await (await fetch("https://mastodon.social/@Gargron", {
            headers: {
                Accept: activityContentType
            }
        })).json()
        const gotMessage = await (await fetch("https://mastodon.social/@Gargron/100254678717223630", {
            headers: {
                Accept: activityContentType
            }
        })).json()
        const receiver = await prisma.user.create({
            data: {
                name: gotUser.preferredUsername,
                host: "mastodon.social",
                keyPair: {
                    create: {
                        publicKey: gotUser.publicKey.publicKeyPem
                    }
                }
            }
        })
        const reply = await prisma.status.create({
            data: {
                text: '<p>Hello world</p>',
                userId: session.user.id,
                replyingTo: {
                    create: {
                        replyingToUser: {
                            connect: {
                                id: receiver.id
                            }
                        },
                        replyingToStatus: {
                            create: {
                                text: gotMessage.content,
                                userId: receiver.id
                            }
                        }
                    }
                }
            }
        })
        fetch(gotUser.inbox, {
            method: "POST",
            headers: {
                'Content-Type': activityContentType
            },
            body: JSON.stringify({
                "@context": "https://www.w3.org/ns/activitystreams",
            
                "id": `message`,
                "type": "Create",
                "actor": "https://my-example.com/actor",
            
                "object": {
                    "id": `https://${env.HOST}/users/${session.user.name}/statuses/${reply.id}`,
                    "type": "Note",
                    "published": reply.createdAt.toISOString(),
                    "attributedTo": `https://${env.HOST}/users/${session.user.name}`,
                    "inReplyTo": "https://mastodon.social/@Gargron/100254678717223630",
                    "content": reply.text,
                    "to": "https://www.w3.org/ns/activitystreams#Public"
                }
            })
        })
    }
    
    res.send('help')
};

export default examples;
