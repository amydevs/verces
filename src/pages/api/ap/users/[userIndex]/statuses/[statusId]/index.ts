import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "server/db/client";
import { sendResError } from "lib/errors";
import { generateNoteFromStatus, StatusInclude } from "lib/models/status";

const status = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userIndex, statusId } = req.query;
    if (typeof userIndex !== "string" || typeof statusId !== "string") {
        return sendResError(res, 400);
    }
    const foundStatus = await prisma.status.findFirst({
        include: {
            ...StatusInclude.include
        },
        where: {
            user: {
                name: userIndex
            },
            id: statusId
        }
    });
    if (!foundStatus) {
        return sendResError(res, 404);
    }
    return res.json(generateNoteFromStatus(foundStatus));
};

export default status;
