import { type IObject } from "../type"
import { type Prisma } from "@prisma/client"

type StatusSmall = Prisma.StatusGetPayload<{
    include: {
        replyingTo: {
            include: {
                replyingToStatus: true,
                replyingToUser: true
            }
        }
    }
}>

export const generateNote = (name: string, domain: string, status: StatusSmall): IObject => {
    const note: IObject = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': `https://${domain}/users/${name}/statuses/${status.id}`,
        'type': 'Note',
        'published': status.createdAt.toISOString(),
        'attributedTo': `https://${domain}/users/${name}`,
        'content': status.text,
        'to': [
            'https://www.w3.org/ns/activitystreams#Public'
        ],
        'cc': [
            `https://${domain}/users/${name}/followers`, 
        ]
    }
    if (status.replyingTo) {
        if (status.replyingTo.replyingToStatus.uri) {
            note.inReplyTo = status.replyingTo.replyingToStatus.url
        }
        else {
            note.inReplyTo = `https://${domain}/users/${status.replyingTo.replyingToUserId}/statuses/${status.replyingTo.replyingToStatusId}`
        }

        if (note.cc) {
            // push all mentions instead later
            if (!Array.isArray(note.cc)) {
                note.cc = [note.cc]
            }
            const { uri } = status.replyingTo.replyingToUser;
            if (typeof uri === 'string') {
                note.cc.push(uri)
            }
            else {
                note.cc.push(`https://${domain}/users/${status.replyingTo.replyingToUserId}`);
            }
        }                
    }
    return note;
}