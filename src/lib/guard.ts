import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { sendResError } from "./errors";

export function streamsGuard<T>(
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

        return handle(req, res);
    };
}