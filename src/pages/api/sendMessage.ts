import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { generateCreate } from "server/activitypub/streams/create";
import { generateNote, statusInclude } from "server/activitypub/streams/note";
import { getServerAuthSession } from "server/common/get-server-auth-session";

import crypto from 'crypto';
import { prisma } from "../../server/db/client";

const examples = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerAuthSession({ req, res });
    const activityContentType = 'application/activity+json';

    const receiverHost = "mastodon.social";
    const receiverName = "Gargon";
    const receiverNoteId = "100254678717223630"

    const inboxFragment = '/inbox'
    const inboxUrl = `https://${receiverHost}${inboxFragment}`;
    const receiverActorUrl = `https://${receiverHost}/users/${receiverName}`
    const receiverNoteUrl = `${receiverActorUrl}/statuses/${receiverNoteId}`

    const user = await prisma.user.findFirst({
        include: {
            keyPair: true
        },
        where: {
            id: session?.user?.id
        }
    });

    if (user?.keyPair?.privateKey) {
        
        const receiverActor = await (await fetch(receiverActorUrl, {
            headers: {
                Accept: activityContentType
            }
        })).json()
        const receiverNote = await (await fetch(receiverNoteUrl, {
            headers: {
                Accept: activityContentType
            }
        })).json()
        const receiverUser = await prisma.user.upsert({
            where: {
                name_host: {
                    name: receiverActor.preferredUsername,
                    host: receiverHost
                }
            },
            update: {},
            create: {
                name: receiverActor.preferredUsername,
                host: receiverHost,
                keyPair: {
                    create: {
                        publicKey: receiverActor.publicKey.publicKeyPem
                    }
                },
                uri: receiverActorUrl
            }
        })
        const receiverStatus = await prisma.status.upsert({
            where: {
                id: receiverNoteId
            },
            update: {},
            create: {
                id: receiverNoteId,
                text: receiverNote.content,
                userId: receiverUser.id
            }
        })
        const replyStatus = await prisma.status.create({
            ...statusInclude,
            data: {
                text: '<p>Hello world</p>',
                userId: user.id,
                replyingTo: {
                    create: {
                        replyingToUser: {
                            connect: {
                                id: receiverUser.id
                            }
                        },
                        replyingToStatus: {
                            connect: {
                                id: receiverStatus.id
                            }
                        }
                    }
                }
            }
        });

        const message = JSON.stringify(generateCreate(user.name, env.HOST, generateNote(user.name, env.HOST, replyStatus)));
        const digestHash = crypto.createHash('sha256').update(message).digest('base64');
        const signer = crypto.createSign('sha256');
        const date = new Date();
        const stringToSign = `(request-target): post ${inboxFragment}\nhost: ${receiverHost}\ndate: ${date.toUTCString()}\ndigest: SHA-256=${digestHash}`;
        signer.update(stringToSign);
        signer.end();
        const signature = signer.sign(user.keyPair?.privateKey);
        const signature_b64 = signature.toString('base64');
        const header = `keyId="https://${env.HOST}/users/${user.name}",headers="(request-target) host date digest",signature="${signature_b64}"`;
        const resp = await fetch(inboxUrl, {
            method: 'POST',
            body: message,
            headers: {
                'Content-Type': activityContentType,
                'Host': receiverHost,
                'Date': date.toUTCString(),
                'Digest': `SHA-256=${digestHash}`,
                'Signature': header
            }
        });
        return res.send(await resp.text());
    }
    
    res.send('help')
};

export default examples;
