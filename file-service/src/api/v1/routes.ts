import { Request, RequestHandler, Response, Router } from "express";
import FileController from "../../controllers/FileController";
import upload from "../../middlewares/upload";
import verifyToken from "../../middlewares/verfiyToken";
import { uploadFileSchema } from "../../schemas/fileSchema";
import { validateData } from "../../middlewares/validationMiddleware";

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
router.post("/file/uploadFile", [upload, verifyToken, validateData(uploadFileSchema)], fileController.uploadFun);
router.get("/file/getFiles", verifyToken, fileController.getAllFiles);
router.delete("/file/deleteFile/:fileId", verifyToken, fileController.deleteFile);
router.get("/file/totalFileSize/:userId", verifyToken, fileController.totalFileSize);
router.get("/file/starredFiles", verifyToken, fileController.starredFiles);

// category
router.get('/file/categories', [verifyToken], fileController.getCategories)

// trash
router.get('/file/trash', [verifyToken], fileController.getTrashFile)
router.put('/file/undoTrash/:fileId', [verifyToken], fileController.undoTrashFile)

export default router;
