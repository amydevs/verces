import type { IActor, IObject, IPost } from "./type";
import { type PrismaClient, Visibility, type Prisma } from "@prisma/client";
import { StatusContext } from "./contexts";
import { getFollowersUri, getIndexUri, getStatusUri, getStatusUrl, getUserStatusFromUri, getUserUri, PublicStream } from "lib/uris";
import { prisma } from "server/db/client";
import { userFromActor } from "./actor";
import { getApObjectBody } from "./utils";

export const statusInclude = {
    include: {
        user: true,
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
    const noteId = typeof doc === "string" ? doc : doc.id;
    if (noteId?.startsWith(getIndexUri())) {
        const { statusIndex } = getUserStatusFromUri(noteId);
        return await prisma.status.findFirstOrThrow({
            where: {
                id: statusIndex
            }
        });
    }

    const gotDoc = await getApObjectBody(doc) as IPost;
    const actor = await getApObjectBody(gotDoc.attributedTo as string) as IActor; // force attributedTo to be a string as it will always exist on a note :3
    const user = await userFromActor(actor);
    const toCc = toCcNormalizer(gotDoc);
    const visibility = getVisibility(toCc, actor.followers?.toString() ?? "");

    const statusData: Prisma.StatusCreateArgs = {
        data: {
            text: `${gotDoc.content}`,
            userId: user.id,
            uri: gotDoc.id,
            url: gotDoc.url?.toString(),
            visibility,
        }
    };

    const createdStatus = await prisma.status.upsert({
        where: {
            uri: gotDoc.id
        },
        update: {
            ...statusData.data,
            updatedAt: new Date(),
        },
        create: {
            ...statusData.data
        }
    });

    //mention stuff
    const mentionedLocalUsersByIndex = toCc.to.concat(toCc.cc).flatMap(e => {
        if (e.startsWith(getIndexUri())) {
            return getUserStatusFromUri(e).userIndex ?? [];
        }
        return [];
    });
    await prisma.mention.deleteMany({
        where: {
            user: {
                name: {
                    notIn: mentionedLocalUsersByIndex
                },
                host: ""
            },
            statusId: createdStatus.id
        }
    });
    if (mentionedLocalUsersByIndex.length > 0) {
        const mentions = await prisma.user.findMany({
            where: {
                name: {
                    in: mentionedLocalUsersByIndex
                },
                host: ""
            }
        }).then(e => e.map(e => ({ userId: e.id, statusId: createdStatus.id })));
        await prisma.mention.createMany({
            data: mentions,
            skipDuplicates: true
        });
    }

    // reply stuff
    if (gotDoc.inReplyTo) {
        const inReplyTo = gotDoc.inReplyTo;
        const replyingToLocalStatus = getUserStatusFromUri(inReplyTo);
        if (inReplyTo.startsWith(getIndexUri()) && replyingToLocalStatus.statusIndex && replyingToLocalStatus.userIndex) {
            await prisma.reply.upsert({
                where: {
                    statusId: createdStatus.id
                },
                update: {},
                create: {
                    status: {connect: {id: createdStatus.id}},
                    replyingToStatus: {connect: {id: replyingToLocalStatus.statusIndex}},
                    replyingToUser: {connect: {name_host: {host: "", name: replyingToLocalStatus.userIndex}}}
                }
            });
        }
        else {
            const repliedToStatus = await prisma.status.findFirst({
                where: {
                    uri: inReplyTo
                },
            }) ?? await statusFromNote(inReplyTo);
            await prisma.reply.upsert({
                where: {
                    statusId: createdStatus.id
                },
                update: {},
                create: {
                    status: {connect: {id: createdStatus.id}},
                    replyingToStatus: {connect: {id: repliedToStatus?.id}},
                    replyingToUser: {connect: {id: repliedToStatus?.userId}}
                }
            });
        }
    }

    return createdStatus;
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
        return Visibility.Private;
    }
    return Visibility.Direct;
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
    case Visibility.Private:
        note.to = [followerStream, ...mentions];
        break;
    case Visibility.Direct:
        note.to = mentions;
        break;
    }
    return note;
};

export const generateNote = (status: StatusSmall, context = true): IPost => {
    const { name } = status.user;
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
    case Visibility.Private:
        note.to = [followerStream, ...mentions];
        break;
    case Visibility.Direct:
        note.to = mentions;
        break;
    }
    return note;
};