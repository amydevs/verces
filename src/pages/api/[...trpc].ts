
import { type NextApiRequest, type NextApiResponse } from "next";
import { createOpenApiNextHandler } from "trpc-openapi";

import { createContext } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";

import NextCors from "nextjs-cors";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  
    await NextCors(req, res, {
    // Options
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        origin: "*",
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    // Handle incoming OpenAPI requests
    return createOpenApiNextHandler({
        router: appRouter,
        createContext,
    })(req, res);
};

export default handler;