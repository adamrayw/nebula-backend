import { Request, Response } from "express";
import AuthService from "../services/AuthService";
import { UserAttributes } from "../db/models/User";
import { StatusCodes } from "http-status-codes";
import argon2 from 'argon2';
import generateToken from "../utils/generateToken";

class AuthController {
    private readonly authService: AuthService;

    constructor() {
        this.authService = new AuthService()
        this.createUser = this.createUser.bind(this)
    }

    createUser = async (req: Request, res: Response) => {
        try {
            const data: UserAttributes = req.body;

            const checkUser = await this.authService.findUser(data)

            if (checkUser) {
                res.status(StatusCodes.CONFLICT).json({
                    status: 0,
                    message: 'User already registered!'
                })
                return;
            }

            const hash = await argon2.hash(data.password)
            data.password = hash;

            const users = await this.authService.createUser(data)

            res.status(StatusCodes.CREATED).json({
                message: "User created successfully!",
                data: {
                    id: users.id,
                    email: users.email,
                    fullName: users.fullName,
                    profile_img: users.profile_img
                }
            })
        } catch (error) {
            if (error instanceof Error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    message: error.message
                })
            }
        }
    }

    findUser = async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const checkIfUserAlreadyExist = await this.authService.findUser(data);

            if (checkIfUserAlreadyExist) {

                // verify password
                const verify = await argon2.verify(checkIfUserAlreadyExist.password, data.password)

                if (verify) {
                    res.status(StatusCodes.OK).json({
                        status: 200,
                        message: "User found!",
                        data: checkIfUserAlreadyExist,
                        token: generateToken(checkIfUserAlreadyExist.email, checkIfUserAlreadyExist.id)
                    })
                    return
                } else {
                    res.status(StatusCodes.BAD_REQUEST).json({
                        message: "Password do not match!"
                    })
                    return
                }
            }

            res.status(StatusCodes.NOT_FOUND).json({
                status: 404,
                message: "User not found",
                data: checkIfUserAlreadyExist
            })
        } catch (error) {
            if (error instanceof Error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    status: 500,
                    message: error.message
                })
            }
        }
    }
}

export default AuthController;