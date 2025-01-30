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

  getStarredFiles = async (
    userId: string,
    search: string,
    offset: string,
    token: string
  ) => {
    let { data, starredData, getStarredFile } = await this.fileRepository.getStarredFiles(userId, search, offset, token);

    // merging file and starred data
    data = data.rows.map((file: FilesAttributes) => ({
      ...file,
      starred:
        starredData.find(
          (star: { fileId: string }) => star.fileId === file.id
        ) || null,
    }));

    // Tampilkan jika hanya dibintangi saja
    data = data.filter(
      (file: FilesAttributes & { starred: any }) => file.starred !== null
    );

    const totalFile = getStarredFile.data.totalFile;
    const lastPage = getStarredFile.data.lastPage

    return {
      data,
      totalFile,
      lastPage
    }
  };

  deleteFile = (fileId: string, token: string) => {
    return this.fileRepository.deleteFile(fileId, token);
  };

  totalFileSize = (userId: string) => {
    return this.fileRepository.totalFileSize(userId);
  };

  getCategories = (userId: string) => {
    return this.fileRepository.getCategories(userId);
  };
}

export default FileService;
