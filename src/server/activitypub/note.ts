import { type IObject } from "./type"
import { type Prisma } from "@prisma/client"
import { type } from "os"

type StatusSmall = Prisma.StatusGetPayload<{
    select: {
        id: true,
        createdAt: true,
        text: true
    }
}>

export const generateNote = (name: string, domain: string, status: StatusSmall): IObject => {
    return {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': `https://${domain}/users/${name}/statuses/${status.id}`,
        'type': 'Note',
        'published': status.createdAt.toISOString(),
        'attributedTo': `https://${domain}/users/${name}`,
        'content': status.text,
        'to': [
            'https://www.w3.org/ns/activitystreams#Public'
        ]
    }
}

type StatusSmallWithReply = StatusSmall & Prisma.StatusGetPayload<{
    include: {
        replyingTo: {
            include: {
                replyingToStatus: true,
                replyingToUser: true
            }
        }
    }
}>

export const generateNoteWithReply = (name: string, domain: string, status: StatusSmallWithReply) => {
    const note = generateNote(name, domain, status);
    if (status.replyingTo) {
        if (status.replyingTo.replyingToStatus.uri) {
            note.inReplyTo = status.replyingTo.replyingToStatus.uri
        }
        else {
            note.inReplyTo = `https://${domain}/users/${status.replyingTo.replyingToUserId}/statuses/${status.replyingTo.replyingToStatusId}`
        }
    }
    return note;
}