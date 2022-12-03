
import { type NextApiRequest, type NextApiResponse } from 'next';
import { createOpenApiNextHandler } from 'trpc-openapi';

import { createContext } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  

  // Handle incoming OpenAPI requests
  return createOpenApiNextHandler({
    router: appRouter,
    createContext,
    responseMeta: (meta) => {
      return {
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  })(req, res);
};

export default handler;