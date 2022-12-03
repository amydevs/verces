import { StatusContext } from "./contexts";
import { type IPost, type ICreate } from "./type";

export const generateCreate = (name: string, domain: string, note: IPost, context = true): ICreate => {
    const actor = `https://${domain}/users/${name}`;
    const createMessage: ICreate = {
        "id": `${note.id}/activity`,
        "type": "Create",
        "actor": actor,
        "attributedTo": actor,
        "to": note.to,
        "cc": note.cc,
        "object": note,
    };
    if (context) {
        createMessage["@context"] = StatusContext;
    }
    return createMessage;
};