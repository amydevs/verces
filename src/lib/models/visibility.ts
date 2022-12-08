import { Visibility } from "@prisma/client";
import type { IObject } from "lib/activities/type";
import { getFollowersUri, PublicStream } from "lib/uris";

export type ToCc = { to: string[], cc: string[] };

export default class VisibilityModel {
    constructor(private readonly visibility: Visibility) {}

    getToCc = (user: string, mentions: string[]) => {
        const note: ToCc = { to: [], cc: [] };
        const followerStream = getFollowersUri(user);
        switch(this.visibility) {
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
    
    static toCcNormalizer = (doc: IObject): ToCc => {
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
    static getVisibility = ({ to, cc }: ToCc, followersUri: string): Visibility => {
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
}