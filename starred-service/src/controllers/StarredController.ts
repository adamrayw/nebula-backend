import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import StarredService from "../services/StarredService";
import { redisClient } from "../config/redis";

class StarredController {
    private readonly starredService: StarredService;

    constructor() {
        this.starredService = new StarredService()
    }

    getStarredsMyFile = async (req: Request, res: Response) => {
        try {
            const userId = req.user as { id: string }

            const getStarredData = await this.starredService.getStarredsMyFile(userId.id)

            res.status(StatusCodes.OK).json({
                status: 200,
                message: "List of starred",
                data: getStarredData
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

    getStarreds = async (req: Request, res: Response) => {
        try {
            const userId = req.user as { id: string }
            const offsetQuery = req.query.offset as string

            const { getStarredData, totalFile, lastPage } = await this.starredService.getStarreds(userId.id, offsetQuery)

            res.status(StatusCodes.OK).json({
                status: 200,
                message: "List of starred",
                data: getStarredData.rows,
                totalFile,
                lastPage
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

    insertStarred = async (req: Request, res: Response) => {
        try {
            const userId = req.user as { id: string }
            const fileId = req.params.fileId

            const insertedStarred = await this.starredService.insertStarred(userId.id, fileId)

            if (insertedStarred === 409) {
                res.status(StatusCodes.CONFLICT).json({
                    status: 409,
                    message: "File already starred",
                })
                return
            }

            const pattern = `files@${userId?.id}*`;
            let cursor = 0;
            let keys: string[] = [];

            try {
                do {
                    const result = await redisClient?.scan(cursor, {
                        MATCH: pattern,
                        COUNT: 100,
                    });

                    cursor = result?.cursor ?? 0;
                    if (result?.keys) {
                        keys.push(...result.keys);
                    }
                } while (cursor !== 0);

                if (keys.length > 0) {
                    const deleteData = await redisClient?.del(keys);
                    console.log("🚀 Data files deleted: ", deleteData);
                } else {
                    console.log(`🤷 No cache keys for user ${userId?.id}`);
                }
            } catch (error) {
                console.error("❌ Error deleting cache keys: ", error);
            }

            res.status(StatusCodes.CREATED).json({
                status: 201,
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

    removeStarred = async (req: Request, res: Response) => {
        try {
            const userId = req.user as { id: string }   
            const fileId = req.params.fileId

            const removeStarred = await this.starredService.removeStarred(fileId)

            // if(removeStarred === 404) {
            //     res.status(StatusCodes.NOT_FOUND).json({
            //         status: 404,
            //         message: "File not found",
            //     })
            //     return
            // }

            const pattern = `files@${userId?.id}*`;
            let cursor = 0;
            let keys: string[] = [];

            try {
                do {
                    const result = await redisClient?.scan(cursor, {
                        MATCH: pattern,
                        COUNT: 100,
                    });

                    cursor = result?.cursor ?? 0;
                    if (result?.keys) {
                        keys.push(...result.keys);
                    }
                } while (cursor !== 0);

                if (keys.length > 0) {
                    const deleteData = await redisClient?.del(keys);
                    console.log("🚀 Data files deleted: ", deleteData);
                } else {
                    console.log(`🤷 No cache keys for user ${userId?.id}`);
                }
            } catch (error) {
                console.error("❌ Error deleting cache keys: ", error);
            }

            res.status(StatusCodes.OK).json({
                status: 200,
                message: "File removed from starred!"
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