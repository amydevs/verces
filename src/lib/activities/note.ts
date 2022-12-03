import { type IPost } from "./type"
import { Visibility, type Prisma } from "@prisma/client"
import { StatusContext } from "./contexts"
import { getFollowersUri, getStatusUri, getStatusUrl, getUserUri, PublicStream } from "lib/uris"

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

export const generateNote = (name: string, status: StatusSmall, context = true): IPost => {
    const note: IPost = {
        'id': getStatusUri(name, status.id),
        'type': 'Note',
        'published': status.createdAt.toISOString(),
        'attributedTo': getUserUri(name),
        'content': status.text,
        'url': getStatusUrl(name, status.id),
    }
    if (context) {
        note["@context"] = StatusContext;
    }

    // set replying
    if (status.replyingTo) {
        if (status.replyingTo.replyingToStatus.uri) {
            note.inReplyTo = status.replyingTo.replyingToStatus.url
        }
        else {
            note.inReplyTo = getStatusUri(status.replyingTo.replyingToUser.name, status.replyingTo.replyingToStatusId)
        }             
    }

    // set to and cc
    const followerStream = getFollowersUri(name);
    if (!Array.isArray(note.to)) {
        note.cc = []
    }
    if (!Array.isArray(note.cc)) {
        note.cc = []
    }
    const mentions = status.mentions.map(e => {
        const { uri } = e.user;
        if (uri?.length) {
            return uri
        }
        return getUserUri(e.user.name);
    })
    switch(status.visibility) {
    case Visibility.Public:
        note.to = [PublicStream, ...mentions];
        note.cc = [followerStream]
        break;
    case Visibility.Unlisted:
        note.to = [followerStream, ...mentions];
        note.cc = [PublicStream]
        break;
    case Visibility.FollowOnly:
        note.to = [followerStream, ...mentions]
        break;
    case Visibility.MentionOnly:
        note.to = mentions;
        break;
    }
    return note;
}