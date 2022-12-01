import { type IObject } from "./type"
import { type Prisma } from "@prisma/client"

type StatusSmall = Prisma.StatusGetPayload<{
    select: {
        id: true,
        createdAt: true,
        text: true
    }
}>

export const generateNote = (name: string, domain: string, status: StatusSmall): IObject => {
    return {
        '@context': 'https://www.w3.org/ns/activitystreams',
        'id': `https://${domain}/users/${name}/statuses/${status.id}`,
        'type': 'Note',
        'published': status.createdAt.toISOString(),
        'attributedTo': `https://${domain}/users/${name}`,
        'content': status.text,
        'to': [
            'https://www.w3.org/ns/activitystreams#Public'
        ]
    }
}