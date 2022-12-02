import { type IPost, type IActivity } from "../type";

export const generateCreate = (name: string, domain: string, note: IPost): IActivity => {
    const actor = `https://${domain}/users/${name}/statuses/${note.id}`;
    const createMessage: IActivity = {
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