import { z } from "zod";

export const zError = z.object({ error: z.string(), description: z.string().optional() });