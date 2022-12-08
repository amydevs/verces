import type { ApObject, IObject } from "./type";
import crypto from "crypto";
import { getUserUri } from "lib/uris";

export const ActivityContentType = "application/activity+json"; 

export const generatePostHeaders = (body: string, userIndex: string, privateKey: string, uri: string) => {
    const url = new URL(uri);
    const digestHash = crypto.createHash("sha256").update(body).digest("base64");
    const signer = crypto.createSign("sha256");
    const date = new Date();
    const stringToSign = `(request-target): post ${url.pathname}\nhost: ${url.host}\ndate: ${date.toUTCString()}\ndigest: SHA-256=${digestHash}`;
    signer.update(stringToSign);
    signer.end();
    const signature = signer.sign(privateKey);
    const signature_b64 = signature.toString("base64");
    const header = `keyId="${getUserUri(userIndex)}",headers="(request-target) host date digest",signature="${signature_b64}"`;
    const headers = {
        "Host": url.host,
        "Date": date.toUTCString(),
        "Digest": `SHA-256=${digestHash}`,
        "Signature": header
    };
    return headers;
};

export const getApObjectBody = async (doc: ApObject, fetchOptions?: RequestInit): Promise<IObject | IObject[]> => {
    if (Array.isArray(doc)) {
        return Promise.all(doc.map(e => getSingleApObjectBody(e)));
    }
    else {
        return getSingleApObjectBody(doc, fetchOptions);
    }
};

export const getSingleApObjectBody = async (doc: IObject | string, fetchOptions?: RequestInit): Promise<IObject> => {
    if (typeof doc === "object") {
        return doc;
    }
    console.log(doc);
    const realFetchOptions: RequestInit = {
        method: "GET",
        headers: {
            "Host": new URL(doc).host,
            "Accept": ActivityContentType,
        },
    };
    if (fetchOptions) {
        Object.assign(realFetchOptions, fetchOptions);
    }
    const ftch = await fetch(doc, realFetchOptions);
    const status = ftch.status;
    const json = await ftch.json();
    if (Math.floor((status / 100) % 10) !== 2 || json["error"]) {
        throw new Error(doc + " : " + status.toString(), {
            cause: JSON.stringify(json)
        });
    }
    return json as IObject;
};