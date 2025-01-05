import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import StarredService from "../services/StarredService";

class StarredController {
    private readonly starredService: StarredService;

    constructor() {
        this.starredService = new StarredService()
    }
    
    insertStarred = async (req: Request, res: Response) => {
        try {
            const userId = req.user as { id: string }
            const fileId = req.params.fileId

            const insertedStarred = await this.starredService.insertStarred(userId.id, fileId)

            if(insertedStarred === 409) {
                res.status(StatusCodes.CONFLICT).json({
                    status: 409,
                    message: "File already starred",
                })
                return
            }

            res.status(StatusCodes.CREATED).json({
                status: 200,
                message: "File Starred!",
                data: insertedStarred
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

export default StarredController;