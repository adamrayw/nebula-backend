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
      file.category = category;

      if (!req.file) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "No file uploaded.",
        });
      }

      const responseFromFiles = await this.fileService.upload(file);

      const pattern = `files@${user?.id}*`;
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
          console.log(`🤷 No cache keys for user ${user?.id}`);
        }
      } catch (error) {
        console.error("❌ Error deleting cache keys: ", error);
      }

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

      const redisKey = `files@${user?.id}?search=${searchQuery}?offset=${offsetQuery}?sort=${sortBy}?order=${sortOrder}`;
      
      const cachedData = await redisClient?.get(redisKey);

      if (cachedData) {
        console.log("💋 Data cached, fetching from cache");
        res.status(StatusCodes.OK).send(JSON.parse(cachedData));
        return
      } else if (!cachedData) {

        const { data, totalFile, lastPage } = await this.fileService.getAllFiles(
          user?.id ?? "",
          searchQuery,
          offsetQuery,
          token.token,
          sortBy,
          sortOrder
        );

        const templateRes = {
          status: 200,
          message: "Get all files successfully!",
          data,
          totalFile: totalFile.count,
          lastPage,
        }

        // If search query is empty, cache the data
        if (req.query.s === '') {
          console.log("🤷 Data not cached, fetching from database");
          const store = await redisClient?.set(redisKey, JSON.stringify(templateRes), { EX: 60 });
          console.log("✔  Status of storing data: ", store);

          res.status(StatusCodes.OK).send({
            status: 200,
            message: "Get all files successfully!",
            data,
            totalFile: totalFile.count,
            lastPage,
          });
          return
        }
      }

      const { data, totalFile, lastPage } = await this.fileService.getAllFiles(
        user?.id ?? "",
        searchQuery,
        offsetQuery,
        token.token,
        sortBy,
        sortOrder
      );

      // If search query is not empty, do not cache the data
      res.status(StatusCodes.OK).json({
        status: 200,
        message: "Get all files successfully!",
        data,
        totalFile: totalFile.count,
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

  deleteFile = async (req: Request, res: Response) => {
    try {
      const token = req as { token: string };
      const fileId = req.params.fileId as string;
      const offset = req.query.offset as number | undefined;
      const user = req.user as { id: string } | undefined;
      let type = req.query.type as string;

      const response = await this.fileService.deleteFile(fileId, token.token, offset ?? 0, type);

      const pattern = `files@${user?.id}?search=*?offset=${offset}?*`;
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
          console.log(`🤷 No cache keys for user ${user?.id}`);
        }
      } catch (error) {
        console.error("❌ Error deleting cache keys: ", error);
      }

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

      const undoTrash = await this.fileService.undoTrashFile(fileId ?? '');

      const pattern = `files@${user?.id}*`;
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
          console.log(`🤷 No cache keys for user ${user?.id}`);
        }
      } catch (error) {
        console.error("❌ Error deleting cache keys: ", error);
      }

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
}

export default UploadController;
