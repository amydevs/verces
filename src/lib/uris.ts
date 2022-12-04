import { env } from "env/server.mjs";

export const defaultParams = {
    protocol: env.PROTOCOL,
    host: env.HOST,
};

export const getIndexUri = ({ protocol, host } = defaultParams) => {
    return new URL(`${protocol}${host}`).toString();
};

export const getUserUri = (user: string, options = defaultParams) => {
    return new URL(`/users/${user}`, getIndexUri(options)).toString();
};
export const getUserUrl = (user: string, options = defaultParams) => {
    return new URL(`/@/${user}`, getIndexUri(options)).toString();
};

export const getInboxUri = (user?: string, options = defaultParams) => {
    if (user) {
        return new URL(`${getUserUri(user, options)}/inbox`).toString();
    }
    else {
        return new URL("/inbox", getIndexUri(options)).toString();
    }
};
export const getOutboxUri = (user: string, options = defaultParams) => {
    return new URL(`${getUserUri(user, options)}/outbox`).toString();
};
export const getFollowersUri = (user: string, options = defaultParams) => {
    return new URL(`${getUserUri(user, options)}/followers`).toString();
};
export const getFollowingUri = (user: string, options = defaultParams) => {
    return new URL(`${getUserUri(user, options)}/following`).toString();
};

export const getStatusUri = (user: string, status: string, options = defaultParams) => {
    return new URL(`${getUserUri(user, options)}/statuses/${status}`).toString();
};
export const getStatusUrl = (user: string, status: string, options = defaultParams) => {
    return new URL(`${getUserUrl(user, options)}/${status}`).toString();
};

export const getStatusActivityUri = (user: string, status: string, options = defaultParams) => {
    return new URL(`${getStatusUri(user, status, options)}/activity`).toString();
};

export const PublicStream = "https://www.w3.org/ns/activitystreams#Public";