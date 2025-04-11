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
    // data = data.rows.map((file: FilesAttributes) => ({
    //   ...file,
    //   starred:
    //     starredData.find(
    //       (star: { fileId: string }) => star.fileId === file.id
    //     ) || null,
    // }));

    // // Tampilkan jika hanya dibintangi saja
    // data = data.filter(
    //   (file: FilesAttributes & { starred: any }) => file.starred !== null
    // );

    const mappedStarredData = data.rows.map((file: FilesAttributes) => ({
      ...file,
      starred:
        starredData.find(
          (star: { fileId: string }) => star.fileId === file.id
        ) || null,
    })).filter(
      (file: FilesAttributes & { starred: any }) => file.starred !== null
    );

    const totalFile = getStarredFile.data.totalFile;
    const lastPage = getStarredFile.data.lastPage

    return {
      data: mappedStarredData,
      totalFile,
      lastPage
    }
  };

  deleteFile = (fileId: string, token: string, offset: number, type: string) => {
    return this.fileRepository.deleteFile(fileId, token, offset, type);
  };

  totalFileSize = (userId: string) => {
    return this.fileRepository.totalFileSize(userId);
  };

  getCategories = (userId: string) => {
    return this.fileRepository.getCategories(userId);
  };

  getTrashFile = (userId: string) => {
    return this.fileRepository.getTrashFile(userId);
  };

  undoTrashFile = (fileId: string) => {
    return this.fileRepository.undoTrashFile(fileId);
  }

  deleteExpiredFiles = (fileId: string) => {
    return this.fileRepository.deleteExpiredFiles();
  }

  getFolders = (userId: string) => {
    return this.fileRepository.getFolders(userId);
  }

  createFolder = (userId: string, folderName: string, parentId: string) => {
    return this.fileRepository.createFolder(userId, folderName, parentId);
  }

  getFilesByFolderId = (folderId: string) => {
    return this.fileRepository.getFilesByFolderId(folderId);
  }
}

export default FileService;
