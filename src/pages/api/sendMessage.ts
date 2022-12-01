import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { generateNoteWithReply } from "server/activitypub/note";
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
        const receiver = await prisma.user.upsert({
            where: {
                name_host: {
                    name: gotUser.preferredUsername,
                    host: "mastodon.social"
                }
            },
            update: {},
            create: {
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
            include: {
                replyingTo: {
                    include: {
                        replyingToStatus: true,
                        replyingToUser: true
                    }
                }
            },
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
                                userId: receiver.id,
                                uri: 'https://mastodon.social/@Gargron/100254678717223630',
                                url: 'https://mastodon.social/@Gargron/100254678717223630'
                            }
                        }
                    }
                }
            }
        })
        await fetch(gotUser.inbox, {
            method: "POST",
            headers: {
                'Content-Type': activityContentType
            },
            body: JSON.stringify({
                "@context": "https://www.w3.org/ns/activitystreams",
            
                "id": `https://${env.HOST}/users/${session.user.id}/statuses/${reply.id}`,
                "type": "Create",
                "actor": "https://${env.HOST}/users/${session.user.id}",
            
                "object": generateNoteWithReply(session.user.id, env.HOST, reply)
            })
        })
    }
    
    res.send('help')
};

export default examples;
