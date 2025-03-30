import { Request, RequestHandler, Response, Router } from "express";
import upload from "../../middlewares/upload";
import verifyToken from "../../middlewares/verfiyToken";
import { uploadFileSchema } from "../../schemas/fileSchema";
import { validateData } from "../../middlewares/validationMiddleware";
import { cachingMiddleware, writeCache } from "../../middlewares/caching";
import FileController from "../../controllers/FileController"
import multer from "multer";

const router = Router();
const fileController = new FileController();
const uploadFile = multer();

// root
router.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    message: "Welcome to NebuloBox API!",
  });
});

// multipart upload 
router.post("/file/uploadMulti", async (req: Request, res: Response, next) => {
  try {
    await fileController.startMultiUpload(req, res);
  } catch (error) {
    next(error);
  }
});
router.post("/file/upload-part", uploadFile.single("filePart"), async (req: Request, res: Response, next) => {
  try {
    await fileController.uploadPart(req, res);
  } catch (error) {
    next(error);
  }
});
router.post("/file/complete-upload", fileController.completeMultiUpload);

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

export default router;
