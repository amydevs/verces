import { IPost, type IActivity } from "../type"
import { type Prisma } from "@prisma/client"

export const statusInclude = {
    include: {
        replyingTo: {
            include: {
                replyingToStatus: true,
                replyingToUser: true
            }
        },
        mentions: {
            include: {
                user: true
            }
        }
    }
}

type StatusSmall = Prisma.StatusGetPayload<typeof statusInclude>

export const generateNote = (name: string, domain: string, status: StatusSmall): IPost => {
    const note: IPost = {
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
        ],
    }
    if (status.replyingTo) {
        if (status.replyingTo.replyingToStatus.uri) {
            note.inReplyTo = status.replyingTo.replyingToStatus.url
        }
        else {
            note.inReplyTo = `https://${domain}/users/${status.replyingTo.replyingToUser.name}/statuses/${status.replyingTo.replyingToStatusId}`
        }             
    }

    if (!note.cc) {
        note.cc = [`https://${domain}/users/${name}/followers`]
    }
    if (!Array.isArray(note.cc)) {
        note.cc = [note.cc]
    }
    for (const mention of status.mentions) {
        const { uri } = mention.user;
        if (uri.length !== 0) {
            note.cc.push(uri)
        }
        else {
            note.cc.push(`https://${domain}/users/${mention.user.name}`);
        }
    }  
    return note;
}