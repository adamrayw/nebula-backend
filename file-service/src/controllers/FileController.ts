import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import FileService from "../services/FileService";
import { FilesAttributes } from "../db/models/File";
import { redisClient } from "../config/redis";

class UploadController {
  private readonly fileService: FileService;

  constructor() {
    this.fileService = new FileService();
  }

  uploadFun = async (req: Request, res: Response) => {
    try {
      const file = req.file as unknown as FilesAttributes;
      const { originalSize, category } = req.body;
      const user = req.user as { id: string } | undefined;
      file.userId = user?.id ?? "";
      file.originalSize = Number(originalSize);
      file.categoryId = category;

      if (!req.file) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "No file uploaded.",
        });
      }

      const responseFromFiles = await this.fileService.upload(file);

      if (responseFromFiles) {
        res.status(StatusCodes.OK).json({
          status: 200,
          message: "Upload file successfully!",
          data: req.file,
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  starredFiles = async (req: Request, res: Response) => {
    try {
      const user = req.user as { id: string } | undefined;
      const searchQuery = req.query.s as string;
      const offsetQuery = req.query.offset as string;
      const token = req as unknown as { token: string };

      const { data, totalFile, lastPage } =
        await this.fileService.getStarredFiles(
          user?.id ?? "",
          searchQuery,
          offsetQuery,
          token.token
        );


      res.status(StatusCodes.OK).json({
        status: 200,
        message: "Get all starred files successfully!",
        data,
        totalFile,
        lastPage,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  getAllFiles = async (req: Request, res: Response) => {
    try {
      const user = req.user as { id: string } | undefined;
      const searchQuery = req.query.s as string;
      const offsetQuery = req.query.offset as string;
      const token = req as unknown as { token: string };
      const sortBy = req.query.sortBy as string
      const sortOrder = req.query.sortOrder as string

      const { data, totalFile, lastPage } = await this.fileService.getAllFiles(
        user?.id ?? "",
        searchQuery,
        offsetQuery,
        token.token,
        sortBy,
        sortOrder
      );

      res.locals.data = {
        status: 200,
        message: "Get all files successfully!",
        data,
        totalFile: totalFile.count,
        lastPage,
      };

      // Tambahkan header agar tidak ada cache di client
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      res.status(StatusCodes.OK).json(res.locals.data);
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  deleteFile = async (req: Request, res: Response) => {
    try {
      const token = req as { token: string };
      const fileId = req.params.fileId as string;
      const offset = req.query.offset as number | undefined;
      const user = req.user as { id: string } | undefined;
      let type = req.query.type as string;

      const response = await this.fileService.deleteFile(fileId, token.token, offset ?? 0, type);

      res.status(StatusCodes.OK).json({
        status: 200,
        message: "File deleted Successfully!",
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  totalFileSize = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      const totalFileSize = await this.fileService.totalFileSize(userId);

      res.status(StatusCodes.OK).json({
        status: 200,
        data: totalFileSize,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  getCategories = async (req: Request, res: Response) => {
    try {
      const userId = req.user as { id: string } | undefined;

      const categories = await this.fileService.getCategories(userId?.id ?? '');

      res.status(StatusCodes.OK).json({
        status: 200,
        data: categories,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  getTrashFile = async (req: Request, res: Response) => {
    try {
      const userId = req.user as { id: string } | undefined;

      const trashFiles = await this.fileService.getTrashFile(userId?.id ?? '');

      res.status(StatusCodes.OK).json({
        status: 200,
        data: trashFiles,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  undoTrashFile = async (req: Request, res: Response) => {
    try {
      const fileId = req.params.fileId as string;
      const user = req.user as { id: string } | undefined;

      const undoTrash = await this.fileService.undoTrashFile(fileId ?? '', user?.id ?? '');

      res.status(StatusCodes.OK).json({
        status: 200,
        data: undoTrash,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  getFolders = async (req: Request, res: Response) => {
    try {
      const userId = req.user as { id: string } | undefined;

      const folders = await this.fileService.getFolders(userId?.id ?? '');

      res.status(StatusCodes.OK).json({
        status: 200,
        data: folders,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  }

  createFolder = async (req: Request, res: Response) => {
    try {
      const userId = req.user as { id: string } | undefined;
      const folderName = req.body.folderName as string;
      const parentId = req.body.parentId as string | undefined;

      const folders = await this.fileService.createFolder(userId?.id ?? '', folderName, parentId ?? '');

      res.status(StatusCodes.CREATED).json({
        status: 201,
        data: folders,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };

  getFilesByFolderId = async (req: Request, res: Response) => {
    try {
      const folderId = req.params.folderId as string;

      const files = await this.fileService.getFilesByFolderId(folderId ?? '');

      res.status(StatusCodes.OK).json({
        status: 200,
        data: files,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 500,
          message: error.message,
        });
      }
    }
  };
}

export default UploadController;
