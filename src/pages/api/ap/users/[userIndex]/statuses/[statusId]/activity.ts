import { env } from "env/server.mjs";
import { type NextApiRequest, type NextApiResponse } from "next";
import { generateCreate } from "lib/activities/create";
import { generateNote, statusInclude } from "lib/activities/note";
import { prisma } from "server/db/client";
import { sendResError } from "lib/errors";
import { Visibility } from "@prisma/client";

const status = async (req: NextApiRequest, res: NextApiResponse) => {
    const { userIndex, statusId } = req.query;
    if (typeof userIndex !== "string" || typeof statusId !== "string") {
        return sendResError(res, 400);
    }

    const publicVisibilities = [
        Visibility.Public,
        Visibility.Unlisted
    ];

    const foundStatus = await prisma.status.findFirst({
        include: {
            user: true,
            ...statusInclude.include
        },
        where: {
            OR: [
                {
                    user: {
                        name: userIndex
                    },
                    id: statusId
                },
                {
                    restatuses: {
                        some: {
                            statusId,
                            user: {
                                name: userIndex
                            },
                            status: {
                                visibility: {
                                    in: publicVisibilities
                                }
                            }
                        },
                    }
                }
            ]           
        }
    });
    if (!foundStatus) {
        return sendResError(res, 404);
    }

    const generatedNote = generateNote(foundStatus.user.name, foundStatus, false);

    if (foundStatus.user.name !== userIndex) {
        return res.json(generatedNote); // add reblog here
    }

    return res.json(generateCreate(generatedNote));
};

export default status;
