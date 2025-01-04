import { Request, Response, Router } from "express";
import { validateData } from "../../middlewares/validationMiddleware";
import { LoginSchema, RegisterSchema } from "../../schemas/userSchemas";
import AuthController from "../../controllers/AuthController";
import verifyToken from "../../middlewares/verfiyToken";
import UserController from "../../controllers/UserController";
import { redisCachingMiddleware, writeThought } from '../../middlewares/redis';

const router = Router();
const authController = new AuthController()
const userController = new UserController()

// root
router.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        status: 200,
        message: "Welcome to NebuloBox API!"
    })
})

// Auth
router.post("/user/login", validateData(LoginSchema), authController.findUser)
router.post("/user/register", validateData(RegisterSchema), authController.createUser)

// user
router.get('/user/getLimit', verifyToken, userController.getLimit)
router.get('/user/getUserInfo', [verifyToken, writeThought()], userController.getUserInfo)

export default router;