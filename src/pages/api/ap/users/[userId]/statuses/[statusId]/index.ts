import { type NextApiRequest, type NextApiResponse } from "next";
import { generateNote, statusInclude } from "lib/activities/note";
import { prisma } from "server/db/client";
import { sendResError } from "lib/errors";

const status = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userId, statusId } = req.query;
    if (typeof userId !== "string" || typeof statusId !== "string") {
        return sendResError(res, 400);
    }
    const foundStatus = await prisma.status.findFirst({
        include: {
            user: true,
            ...statusInclude.include
        },
        where: {
            user: {
                name: userId
            },
            id: statusId
        }
    });
    if (!foundStatus) {
        return sendResError(res, 404);
    }
    return res.json(generateNote(foundStatus.user.name, foundStatus));
};

export default status;
