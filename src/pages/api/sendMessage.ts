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

    const receiverHost = req.query.host as string;
    const receiverName = req.query.name as string;
    const receiverNoteId = req.query.note as string;

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
                uri: receiverActorUrl,
                url: receiverActor.url
            }
        })
        const receiverStatus = await prisma.status.upsert({
            where: {
                uri: receiverNoteUrl
            },
            update: {},
            create: {
                text: receiverNote.content,
                userId: receiverUser.id,
                uri: receiverNoteUrl,
                url: receiverNote.url,
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
                'Host': receiverHost,
                'Date': date.toUTCString(),
                'Digest': `SHA-256=${digestHash}`,
                'Signature': header
            }
        });
        console.log(resp)
        return res.send(`${resp.status}\n\n\n${await resp.text()}`);
    }
    
    res.send('help')
};

export default examples;
