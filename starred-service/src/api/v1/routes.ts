import { Request, Response, Router } from "express";
import verifyToken from "../../middlewares/verfiyToken";
import StarredController from "../../controllers/StarredController";

const router = Router();
const starredController = new StarredController()

// root
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        status: 200,
        message: "Welcome to NebuloBox API!"
    })
})

// file
router.post('/file/starred/:fileId', verifyToken, starredController.insertStarred)
router.delete('/file/starred/:fileId', verifyToken, starredController.removeStarred)
router.get("/file/starred", verifyToken, starredController.getStarreds)
router.get("/file/starredMyFiles", verifyToken, starredController.getStarredsMyFile)

export default router;