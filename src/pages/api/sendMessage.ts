import { type NextApiRequest, type NextApiResponse } from "next";
import { generateKeyPair } from "server/activitypub/keypair";

import { prisma } from "../../server/db/client";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
    const activityContentType = 'application/activity+json';
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
            },
            statuses: { 
                create: {
                    text: gotMessage.content,
                    uri: gotMessage.id,
                    url: "https://mastodon.social/@Gargron/100254678717223630"
                } 
            }
        }
    })
    const message = await prisma.user.create({
        include: {
            statuses: true
        },
        data: {
            name: "test",
            keyPair: {
                create: {
                    ...(await generateKeyPair())
                }
            },
            statuses: {
                create: {
                    text: "<p>Hello World!</p>",
                    replyUserId: receiver.id
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
        
            "id": "https://${}/create-hello-world",
            "type": "Create",
            "actor": "https://my-example.com/actor",
        
            "object": {
                "id": "https://my-example.com/hello-world",
                "type": "Note",
                "published": "2018-06-23T17:17:11Z",
                "attributedTo": "https://my-example.com/actor",
                "inReplyTo": "https://mastodon.social/@Gargron/100254678717223630",
                "content": "<p>Hello world</p>",
                "to": "https://www.w3.org/ns/activitystreams#Public"
            }
        })
    })
    
    res.send('help')
};

export default examples;
