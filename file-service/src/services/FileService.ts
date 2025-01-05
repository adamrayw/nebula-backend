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

    getAllFiles = (userId: string, search: string, offset: string) => {
        return this.fileRepository.getAllFiles(userId, search, offset)
    }

    deleteFile = (fileId: string) => {
        return this.fileRepository.deleteFile(fileId)
    }

    totalFileSize = (userId: string) => {
        return this.fileRepository.totalFileSize(userId)
    }
    
    insertStarred = (userId: string, fileId: string) => {
        return this.fileRepository.insertStarred(userId, fileId)
    }

}

export default FileService;