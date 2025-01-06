import StarredRepository from "../repositories/StarredRepository";

class StarredService {
    private readonly starredRepository: StarredRepository;

    constructor() {
        this.starredRepository = new StarredRepository()
    }

    getStarreds = (userId: string) => {
        return this.starredRepository.getStarreds(userId)
    }

    insertStarred = (userId: string, fileId: string) => {
        return this.starredRepository.insertStarred(userId, fileId)
    }
    
    removeStarred = (fileId: string) => {
        return this.starredRepository.removeStarred(fileId)
    }

}

export default StarredService;