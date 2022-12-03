import { env } from "env/server.mjs"

const defaultParams = {
    protocol: env.PROTOCOL,
    host: env.HOST,
}

export const getIndexUri = ({ protocol, host } = defaultParams) => {
    return new URL(`${protocol}${host}`).toString()
}

export const getUserUri = (user: string, options = defaultParams) => {
    return new URL(`/users/${user}`, getIndexUri(options)).toString()
}

export const getInboxUri = (user?: string, options = defaultParams) => {
    if (user) {
        return new URL('/inbox', getUserUri(user, options)).toString()
    }
    else {
        return new URL('/inbox', getIndexUri(options)).toString()
    }
}
export const getOutboxUri = (user: string, options = defaultParams) => {
    return new URL('/inbox', getUserUri(user, options)).toString()
}
export const getFollowersUri = (user: string, options = defaultParams) => {
    return new URL('/followers', getUserUri(user, options)).toString()
}
export const getFollowingUri = (user: string, options = defaultParams) => {
    return new URL('/following', getUserUri(user, options)).toString()
}

export const getStatusUri = (user: string, status: string, options = defaultParams) => {
    return new URL(`/statuses/${status}`, getUserUri(user, options)).toString()
}

export const getStatusActivityUri = (user: string, status: string, options = defaultParams) => {
    return new URL(`/activity`, getStatusUri(user, status, options)).toString()
}