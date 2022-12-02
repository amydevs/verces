import { type IPost } from "../type"
import { Visibility, type Prisma } from "@prisma/client"

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
    }

    // set replying
    if (status.replyingTo) {
        if (status.replyingTo.replyingToStatus.uri) {
            note.inReplyTo = status.replyingTo.replyingToStatus.url
        }
        else {
            note.inReplyTo = `https://${domain}/users/${status.replyingTo.replyingToUser.name}/statuses/${status.replyingTo.replyingToStatusId}`
        }             
    }

    // set to and cc
    const publicStream = 'https://www.w3.org/ns/activitystreams#Public';
    const followerStream = `https://${domain}/users/${name}/followers`;
    if (!Array.isArray(note.to)) {
        note.cc = []
    }
    if (!Array.isArray(note.cc)) {
        note.cc = []
    }
    const mentions = status.mentions.map(e => {
        const { uri } = e.user;
        if (uri.length !== 0) {
            return uri
        }
        return `https://${domain}/users/${e.user.name}`;
    })
    // switch(status.visibility) {
    //     case Visibility.Public:
    //         note.to = [publicStream, ...mentions];
    //         note.cc = [followerStream]
    //         break;
    //     case Visibility.Unlisted:
    //         note.to = [followerStream, ...mentions];
    //         note.cc = [publicStream]
    //         break;
    //     case Visibility.FollowOnly:
    //         note.to = [followerStream, ...mentions]
    //         break;
    //     case Visibility.MentionOnly:
    //         note.to = mentions;
    //         break;
    // }
    note.to = [publicStream]
    return note;
}