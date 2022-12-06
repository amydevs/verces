import { IActor, IObject, type IPost } from "./type";
import { Visibility, type Prisma } from "@prisma/client";
import { StatusContext } from "./contexts";
import { getFollowersUri, getIndexUri, getStatusUri, getStatusUrl, getUserUri, PublicStream } from "lib/uris";
import { prisma } from "server/db/client";
import { userFromActor, userFromUri } from "./actor";
import { getApObjectBody } from "./utils";

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
};

type StatusSmall = Prisma.StatusGetPayload<typeof statusInclude>

export const statusFromNote = async (doc: IPost | string) => {
    const gotDoc = await getApObjectBody(doc) as IPost;
    if (typeof gotDoc.attributedTo === "string" ) {
        const actor = await getApObjectBody(gotDoc.attributedTo) as IActor;
        const user = await userFromActor(actor);
        const toCc = toCcNormalizer(gotDoc);
        const visibility = getVisibility(toCc, actor.followers?.toString() ?? "");

        // add updating later
        prisma.status.upsert({
            where: {
                uri: gotDoc.id
            },
            update: {},
            create: {
                text: `${gotDoc.content}`,
                userId: user.id,
                uri: gotDoc.id,
                url: gotDoc.url?.toString(),
                visibility
            }
        });
    }
};

type ToCc = { to: string[], cc: string[] };

export const toCcNormalizer = (doc: IObject) => {
    const flatMapFunc = (e: string | IObject | undefined) => {
        if (typeof e === "object") {
            return e.id ? e.id : [];
        }
        return e ?? [];
    };
    return { 
        to: Array.isArray(doc.to) ? doc.to.flatMap(flatMapFunc) : [doc.to].flatMap(flatMapFunc),
        cc: Array.isArray(doc.cc) ? doc.cc.flatMap(flatMapFunc) : [doc.cc].flatMap(flatMapFunc)
    };

};
export const getVisibility = ({ to, cc }: ToCc, followersUri: string): Visibility => {
    if (to.includes(PublicStream)) {
        return Visibility.Public;
    }
    if (cc.includes(PublicStream)) {
        return Visibility.Unlisted;
    }
    if (cc.includes(followersUri) || to.includes(followersUri)) {
        return Visibility.FollowOnly;
    }
    return Visibility.MentionOnly;
};
export const getToCc = (visibility: Visibility, user: string, mentions: string[]) => {
    const note: ToCc = { to: [], cc: [] };
    const followerStream = getFollowersUri(user);
    switch(visibility) {
    case Visibility.Public:
        note.to = [PublicStream, ...mentions];
        note.cc = [followerStream];
        break;
    case Visibility.Unlisted:
        note.to = [followerStream, ...mentions];
        note.cc = [PublicStream];
        break;
    case Visibility.FollowOnly:
        note.to = [followerStream, ...mentions];
        break;
    case Visibility.MentionOnly:
        note.to = mentions;
        break;
    }
    return note;
};

export const generateNote = (name: string, status: StatusSmall, context = true): IPost => {
    const note: IPost = {
        "id": getStatusUri(name, status.id),
        "type": "Note",
        "published": status.createdAt.toISOString(),
        "attributedTo": getUserUri(name),
        "content": status.text,
        "url": getStatusUrl(name, status.id),
        "to": [],
        "cc": []
    };
    if (context) {
        note["@context"] = StatusContext;
    }

    // set replying
    if (status.replyingTo) {
        if (status.replyingTo.replyingToStatus.uri) {
            note.inReplyTo = status.replyingTo.replyingToStatus.url;
        }
        else {
            note.inReplyTo = getStatusUri(status.replyingTo.replyingToUser.name, status.replyingTo.replyingToStatusId);
        }             
    }

    // set to and cc
    const followerStream = getFollowersUri(name);
    const mentions = status.mentions.map(e => {
        const { uri } = e.user;
        if (uri?.length) {
            return uri;
        }
        return getUserUri(e.user.name);
    });
    switch(status.visibility) {
    case Visibility.Public:
        note.to = [PublicStream, ...mentions];
        note.cc = [followerStream];
        break;
    case Visibility.Unlisted:
        note.to = [followerStream, ...mentions];
        note.cc = [PublicStream];
        break;
    case Visibility.FollowOnly:
        note.to = [followerStream, ...mentions];
        break;
    case Visibility.MentionOnly:
        note.to = mentions;
        break;
    }
    return note;
};