import { Request, Response, Router } from "express";
import FileController from "../../controllers/FileController";
import upload from "../../middlewares/upload";
import verifyToken from "../../middlewares/verfiyToken";
import { redisCachingMiddleware, writeThought } from '../../middlewares/redis';

const router = Router();
const fileController = new FileController()

// root
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        status: 200,
        message: "Welcome to NebuloBox API!"
    })
})

// file
router.post('/file/uploadFile', [upload, verifyToken, writeThought()], fileController.uploadFun)
router.get('/file/getFiles', verifyToken, redisCachingMiddleware(), fileController.getAllFiles)
router.delete('/file/deleteFile/:fileId', verifyToken, writeThought(), fileController.deleteFile)
router.get('/file/totalFileSize/:userId', verifyToken, fileController.totalFileSize)

export default router;