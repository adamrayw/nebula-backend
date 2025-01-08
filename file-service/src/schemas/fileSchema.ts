import { z } from "zod";

export const uploadFileSchema = z.object({
    userId: z.string(),
    originalSize: z.string()
})