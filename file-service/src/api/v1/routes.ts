import { Request, RequestHandler, Response, Router } from "express";
import FileController from "../../controllers/FileController";
import upload from "../../middlewares/upload";
import verifyToken from "../../middlewares/verfiyToken";
import { createNewFolderSchema, uploadFileSchema } from "../../schemas/fileSchema";
import { validateData } from "../../middlewares/validationMiddleware";
import { cachingMiddleware, writeCache } from "../../middlewares/caching";

const router = Router();
const fileController = new FileController();

// root
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: "Welcome to NebuloBox API!",
  });
});

// file
router.post("/file/uploadFile", [upload, verifyToken, validateData(uploadFileSchema), writeCache], fileController.uploadFun);
router.get("/file/getFiles", [verifyToken, cachingMiddleware], fileController.getAllFiles);
router.delete("/file/deleteFile/:fileId", [verifyToken, writeCache], fileController.deleteFile);
router.get("/file/totalFileSize/:userId", verifyToken, fileController.totalFileSize);
router.get("/file/starredFiles", verifyToken, fileController.starredFiles);

// category
router.get('/file/categories', [verifyToken], fileController.getCategories)

// trash
router.get('/file/trash', [verifyToken], fileController.getTrashFile)
router.put('/file/undoTrash/:fileId', [verifyToken, writeCache], fileController.undoTrashFile)

// folders
router.get('/file/folders', [verifyToken], fileController.getFolders)
router.get('/file/folders/:folderId', [verifyToken], fileController.getFilesByFolderId)
router.post('/file/folders', [verifyToken], validateData(createNewFolderSchema), fileController.createFolder)

// pin
router.post('/file/pin', [verifyToken, writeCache], fileController.pinItem)
router.delete('/file/unpin', [verifyToken, writeCache], fileController.unpinItem)
router.get('/file/pinnedItems', [verifyToken], fileController.pinnedItems)

export default router;
