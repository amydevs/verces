import { StatusContext } from "./contexts";
import { type IPost, type ICreate } from "./type";

export const generateCreate = (note: IPost, context = true): ICreate => {
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