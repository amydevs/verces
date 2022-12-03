import type { NextApiResponse } from "next";
import { z } from "zod";

export const RES_ERROR = z.object({ error: z.string(), description: z.string().optional() });
export const RES_ERRORS: Record<number, typeof RES_ERROR._type> = {
    400: { error: "Bad Request" },
    404: { error: "Not Found" },
    500: { error: "Internal Server Error" },
}
export const sendResError = (res: NextApiResponse, status: number, description?: string) => {
    const resError = RES_ERRORS[status] || { error: "Unknown Error" };
    if (description) {
        resError.description = description
    }
    return res.status(status).json(RES_ERRORS[status])
}

