import { FilesAttributes } from "../db/models/File";
import FileRepository from "../repositories/FileRepository";

class FileService {
    private readonly fileRepository: FileRepository;

    constructor() {
        this.fileRepository = new FileRepository()
    }

    upload = (data: FilesAttributes) => {
        return this.fileRepository.upload(data)
    }

    getAllFiles = (userId: string, search: string, offset: string, token: string) => {
        return this.fileRepository.getAllFiles(userId, search, offset, token)
    }

    deleteFile = (fileId: string) => {
        return this.fileRepository.deleteFile(fileId)
    }

    totalFileSize = (userId: string) => {
        return this.fileRepository.totalFileSize(userId)
    }
    
}

export default FileService;