import { Request, Response, Router } from "express";
import verifyToken from "../../middlewares/verfiyToken";
import StarredController from "../../controllers/StarredController";
import { writeThought } from "../../middlewares/redis";

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
router.post('/file/starred/:fileId', [verifyToken, writeThought()], starredController.insertStarred)
router.delete('/file/starred/:fileId', [verifyToken, writeThought()], starredController.removeStarred)
router.get("/file/starred", [verifyToken, writeThought()], starredController.getStarreds)
router.get("/file/starredMyFiles", [verifyToken, writeThought()], starredController.getStarredsMyFile)

export default router;