import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { v1Router } from "./v1";

export const appRouter = router({
    example: exampleRouter,
    auth: authRouter,
    v1: v1Router
});

// export type definition of API
export type AppRouter = typeof appRouter;
