import { env } from "env/server.mjs"

const defaultParams = {
    protocol: "https://",
    host: env.HOST,
}

export const getIndexUri = ({ protocol, host } = defaultParams) => {
    return new URL(`${protocol}${host}`)
}

export const getUserUri = (user: string, options = defaultParams) => {
    return new URL(`/users/${user}`, getIndexUri(options))
}

export const getInboxUri = (user?: string, options = defaultParams) => {
    if (user) {
        return new URL('/inbox', getUserUri(user, options))
    }
    else {
        return new URL('/inbox', getIndexUri(options))
    }
}
export const getOutboxUri = (user: string, options = defaultParams) => {
    return new URL('/inbox', getUserUri(user, options))
}
export const getFollowersUri = (user: string, options = defaultParams) => {
    return new URL('/followers', getUserUri(user, options))
}
export const getFollowingUri = (user: string, options = defaultParams) => {
    return new URL('/following', getUserUri(user, options))
}

export const getStatusUri = (user: string, status: string, options = defaultParams) => {
    return new URL(`/statuses/${status}`, getUserUri(user, options))
}

export const getStatusActivityUri = (user: string, status: string, options = defaultParams) => {
    return new URL(`/activity`, getStatusUri(user, status, options))
}