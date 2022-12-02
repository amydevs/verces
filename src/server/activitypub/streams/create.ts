import { type IPost, type ICreate } from "../type";

export const generateCreate = (name: string, domain: string, note: IPost): ICreate => {
    const actor = `https://${domain}/users/${name}`;
    const createMessage: ICreate = {
        '@context': 'https://www.w3.org/ns/activitystreams',

        'id': `${note.id}/activity`,
        'type': 'Create',
        'actor': actor,
        'attributedTo': actor,
        'to': note.to,
        'cc': note.cc,
        'object': note,
        
    }
    return createMessage;
}