import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserService from "../services/UserService";

class UserController {
    private readonly userService: UserService;

    constructor() {
        this.userService = new UserService()
        this.getLimit = this.getLimit.bind(this)
        this.getUserInfo = this.getUserInfo.bind(this)
        this.updateLimit = this.updateLimit.bind(this)
    }

    async getLimit(req: Request, res: Response) {
        try {
            const user = req.user as { id: string } | undefined;
            const data = await this.userService.getLimit(user?.id ?? '')

            if (data) {
                res.status(StatusCodes.OK).json({
                    status: 200,
                    message: 'Get Limit Success!',
                    data
                })
            }

        } catch (error) {
            if (error instanceof Error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    status: 500,
                    message: error.message
                })
                console.log(error)
            }
        }
    }
    
    async getUserInfo(req: Request, res: Response) {
        try {
            const user = req.user as { id: string } | undefined;
            const token = req as { token: string } | undefined;
            const data = await this.userService.getUserInfo(user?.id ?? '', token?.token ?? '')

            if (data) {
                res.status(StatusCodes.OK).json({
                    status: 200,
                    message: 'Get Limit Success!',
                    data
                })
            }

        } catch (error) {
            if (error instanceof Error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    status: 500,
                    message: error.message
                })
                console.log(error)
            }
        }
    }

    async updateLimit(req: Request, res: Response) {
        try {
            const { limit, userId } = req.body;
            const data = await this.userService.updateLimit(userId, limit)

            if (data) {
                res.status(StatusCodes.OK).json({
                    status: 200,
                    message: 'Update Limit Success!',
                    data
                })
            }

        } catch (error) {
            if (error instanceof Error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    status: 500,
                    message: error.message
                })
                console.log(error)
            }
        }
    }

}

export default UserController;