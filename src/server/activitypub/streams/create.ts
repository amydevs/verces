import { type IActivity } from "../type";

export const generateCreate = (name: string, domain: string, note: IActivity) => {
    const createMessage: IActivity = {
        '@context': 'https://www.w3.org/ns/activitystreams',
    
        'id': `${note.id}/activity`,
        'type': 'Create',
        'actor': note.id,
        'to': ['https://www.w3.org/ns/activitystreams#Public'],
        'cc': [follower],
    
        'object': noteMessage
    }
}