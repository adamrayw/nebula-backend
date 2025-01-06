import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import FileService from "../services/FileService";
import { FilesAttributes } from "../db/models/File";

class UploadController {
    private readonly fileService: FileService;

    constructor() {
        this.fileService = new FileService()
    }

    uploadFun = async (req: Request, res: Response) => {
        try {
            const file = req.file as unknown as FilesAttributes;
            const { originalSize } = req.body
            const user = req.user as { id: string } | undefined;
            file.userId = user?.id ?? '';
            file.originalSize = Number(originalSize);

            if (!req.file) {
                res.status(StatusCodes.BAD_REQUEST).json({
                    message: 'No file uploaded.',
                });
            }

            const responseFromFiles = await this.fileService.upload(file)

            if (responseFromFiles) {
                res.status(StatusCodes.OK).json({
                    status: 200,
                    message: 'Upload file successfully!',
                    data: req.file
                })
            }
        } catch (error) {
            if (error instanceof Error) {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    status: 500,
                    message: error.message
                })
            }
        }
    }

    getAllFiles = async (req: Request, res: Response) => {
        try {
            const user = req.user as { id: string } | undefined;
            const searchQuery = req.query.s as string;
            const offsetQuery = req.query.offset as string;
            const token = req as unknown as { token: string }

            const { data, totalFile, lastPage } = await this.fileService.getAllFiles(user?.id ?? '', searchQuery, offsetQuery, token.token)

            res.status(StatusCodes.OK).json({
                status: 200,
                message: "Get all files successfully!",
                data,
                totalFile: totalFile.count,
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

    deleteFile = async (req: Request, res: Response) => {
        try {
            const fileId = req.params.fileId as string;

            const response = await this.fileService.deleteFile(fileId)

            res.status(StatusCodes.OK).json({
                status: 200,
                message: "File deleted Successfully!"
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

    totalFileSize = async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId

            const totalFileSize = await this.fileService.totalFileSize(userId)

            res.status(StatusCodes.OK).json({
                status: 200,
                data: totalFileSize
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

export default UploadController;