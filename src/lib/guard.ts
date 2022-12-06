import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { sendResError } from "./errors";
import httpSignature from "@peertube/http-signature";
import { getApObjectBody } from "./activities/utils";
import type { IActor } from "./activities/type";

export function signatureGuard<T>(
    handle: NextApiHandler<T>
) {
    return async (
        req: NextApiRequest,
        res: NextApiResponse
    ) => {
        const headerSignature = req.headers.signature;

        if (!headerSignature) {
            return sendResError(res, 400, "Invalid Signature");
        }
        const parsed = httpSignature.parseRequest(req);
        if (!parsed.keyId) {
            return sendResError(res, 400, "Cannot find public key from user keyId.");
        }
        const actor = await getApObjectBody(parsed.keyId) as IActor;
        if (!actor.publicKey?.publicKeyPem) {
            return sendResError(res, 400, "Public key does exist for actor.");
        }
        if (!httpSignature.verifySignature(parsed, actor.publicKey.publicKeyPem)) {
            return sendResError(res, 400, "Signature could not be verified with public key.");
        }

        return handle(req, res);
    };
}