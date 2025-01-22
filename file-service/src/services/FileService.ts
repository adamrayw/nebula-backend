import { FilesAttributes } from "../db/models/File";
import FileRepository from "../repositories/FileRepository";

class FileService {
  private readonly fileRepository: FileRepository;

  constructor() {
    this.fileRepository = new FileRepository();
  }

  upload = (data: FilesAttributes) => {
    return this.fileRepository.upload(data);
  };

  getAllFiles = async (
    userId: string,
    search: string,
    offset: string,
    token: string,
    sortBy: string,
    sortOrder: string
  ) => {
    let { starredData, data, totalFile } = await this.fileRepository.getAllFiles(userId, search, offset, token, sortBy, sortOrder);

    data = data.map((file: FilesAttributes) => ({
      ...file,
      starred:
        starredData.find(
          (star: { fileId: string }) => star.fileId === file.id
        ) || null,
    }));

    const lastPage = Math.ceil(totalFile.count / 10);

    return {
      data,
      lastPage,
      totalFile
    };
  };

  getStarredFiles = (
    userId: string,
    search: string,
    offset: string,
    token: string
  ) => {
    return this.fileRepository.getStarredFiles(userId, search, offset, token);
  };

  deleteFile = (fileId: string) => {
    return this.fileRepository.deleteFile(fileId);
  };

  totalFileSize = (userId: string) => {
    return this.fileRepository.totalFileSize(userId);
  };

  getCategories = (userId: string) => {
    return this.fileRepository.getCategories(userId);
  };
}

export default FileService;
