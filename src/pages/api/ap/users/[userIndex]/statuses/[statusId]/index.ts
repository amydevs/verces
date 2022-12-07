import { type NextApiRequest, type NextApiResponse } from "next";
import { generateNote, statusInclude } from "lib/activities/note";
import { prisma } from "server/db/client";
import { sendResError } from "lib/errors";

const status = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userIndex, statusId } = req.query;
    if (typeof userIndex !== "string" || typeof statusId !== "string") {
        return sendResError(res, 400);
    }
    const foundStatus = await prisma.status.findFirst({
        include: {
            ...statusInclude.include
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
    return res.json(generateNote(foundStatus));
};

export default status;
