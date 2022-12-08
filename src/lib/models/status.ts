import type { Prisma, PrismaClient, Status} from "@prisma/client";
import { Visibility } from "@prisma/client";
import { getApObjectBody } from "lib/activities/utils";
import { getFollowersUri, getIndexUri, getStatusUri, getStatusUrl, getUserStatusFromUri, getUserUri, PublicStream } from "lib/uris";
import type { IActor, ICreate, IObject, IPost } from "../activities/type";
import { prisma } from "server/db/client";
import User from "./user";
import { StatusContext } from "lib/activities/contexts";
import VisibilityModel from "./visibility";

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
        if (!gotDoc.attributedTo) console.log(doc, JSON.stringify(gotDoc));
        const actor = await getApObjectBody(gotDoc.attributedTo as string) as IActor; // force attributedTo to be a string as it will always exist on a note :3
        const user = await new User(prisma.user).fromActor(actor);
        const toCc = VisibilityModel.toCcNormalizer(gotDoc);
        const visibility = VisibilityModel.getVisibility(toCc, actor.followers?.toString() ?? "");
    
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
        const inReplyToId = typeof gotDoc.inReplyTo === "string" ? gotDoc.inReplyTo : gotDoc.inReplyTo?.id;
        if (inReplyToId) {
            const replyingToLocalStatus = getUserStatusFromUri(inReplyToId);
            if (inReplyToId.startsWith(getIndexUri()) && replyingToLocalStatus.statusIndex && replyingToLocalStatus.userIndex) {
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
                        uri: inReplyToId
                    },
                }) ?? await this.createFromNote(inReplyToId);
                await prisma.reply.upsert({
                    where: {
                        statusId: createdStatus.id
                    },
                    update: {},
                    create: {
                        status: {connect: {id: createdStatus.id}},
                        replyingToStatus: {connect: {id: repliedToStatus.id}},
                        replyingToUser: {connect: {id: repliedToStatus.userId}}
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

export const generateNoteFromStatus = (status: Prisma.StatusGetPayload<typeof StatusInclude>, context = true): IPost => {
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
        const replyingToUri = status.replyingTo.replyingToStatus.uri;
        if (replyingToUri) {
            note.inReplyTo = replyingToUri;
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
    const toCc = new VisibilityModel(status.visibility).getToCc(status.user.name, mentions);
    note.to = toCc.to;
    note.cc = toCc.cc;

    return note;
};
export const generateCreateFromNote = (note: IPost, context = true): ICreate => {
    const actor = note.attributedTo;
    const createMessage: ICreate = {
        "id": `${note.id}/activity`,
        "type": "Create",
        "actor": `${actor}`,
        "to": note.to,
        "cc": note.cc,
        "object": note,
    };
    if (context) {
        createMessage["@context"] = StatusContext;
    }
    return createMessage;
};

