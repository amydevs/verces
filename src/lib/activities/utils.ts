import type { ApObject, IObject } from "./type";

export const toObject = async (doc: ApObject): Promise<IObject | IObject[]> => {
    if (Array.isArray(doc)) {
        return Promise.all(doc.map(e => toSingleObject(e)));
    }
    else {
        return toSingleObject(doc);
    }
};

export const toSingleObject = async (doc: IObject | string): Promise<IObject> => {
    if (typeof doc === "object") {
        return doc;
    }
    const ftch = await fetch(doc, {
        headers: {
            "Accept": "application/activity+json",
        }
    }).then(e => e.json());
    return ftch as IObject;
};