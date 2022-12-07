import type { Prisma, PrismaClient, Status} from "@prisma/client";
import { Visibility } from "@prisma/client";
import { getApObjectBody } from "lib/activities/utils";
import { getFollowersUri, getIndexUri, getStatusUri, getStatusUrl, getUserStatusFromUri, getUserUri, PublicStream } from "lib/uris";
import type { IActor, IObject, IPost } from "../activities/type";
import { prisma } from "server/db/client";
import User from "./user";
import { StatusContext } from "lib/activities/contexts";

export const StatusInclude = {
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

export default class StatusModel {
    constructor(private readonly prismaStatus: PrismaClient["status"]) {}

    createFromNote = async (doc: IPost | string): Promise<Status> => {
        const noteId = typeof doc === "string" ? doc : doc.id;
        if (noteId?.startsWith(getIndexUri())) {
            const { statusIndex } = getUserStatusFromUri(noteId);
            return await this.prismaStatus.findFirstOrThrow({
                where: {
                    id: statusIndex
                }
            });
        }
    
        const gotDoc = await getApObjectBody(doc) as IPost;
        const actor = await getApObjectBody(gotDoc.attributedTo as string) as IActor; // force attributedTo to be a string as it will always exist on a note :3
        const user = await new User(prisma.user).fromActor(actor);
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
    
        const createdStatus = await this.prismaStatus.upsert({
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
                const repliedToStatus = await this.prismaStatus.findFirst({
                    where: {
                        uri: inReplyTo
                    },
                }) ?? await this.createFromNote(inReplyTo);
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

    generateNoteFromId = async (statusId: string, context = true): Promise<IPost> => {
        const status = await this.prismaStatus.findFirstOrThrow({
            ...StatusInclude,
            where: {
                id: statusId
            }
        });
        return await generateNoteFromStatus(status, context);
    };
}

type ToCc = { to: string[], cc: string[] };

export const generateNoteFromStatus = async (status: Prisma.StatusGetPayload<typeof StatusInclude>, context = true): Promise<IPost> => {
    const note: IPost = {
        "id": getStatusUri(status.user.name, status.id),
        "type": "Note",
        "published": status.createdAt.toISOString(),
        "attributedTo": getUserUri(status.user.name),
        "content": status.text,
        "url": getStatusUrl(status.user.name, status.id),
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
    const mentions = status.mentions.map(e => {
        const { uri } = e.user;
        if (uri?.length) {
            return uri;
        }
        return getUserUri(e.user.name);
    });
    const toCc = getToCc(status.visibility, status.user.name, mentions);
    note.to = toCc.to;
    note.cc = toCc.cc;

    return note;
};

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