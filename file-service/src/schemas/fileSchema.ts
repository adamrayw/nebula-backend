import { z } from "zod";

export const uploadFileSchema = z.object({
    userId: z.string(),
    originalSize: z.string()
})

export const createNewFolderSchema = z.object({
    userId: z.string(),
    folderName: z.string(),
    parentId: z.string().optional()
})