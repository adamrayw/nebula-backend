import StarredRepository from "../repositories/StarredRepository";

class StarredService {
    private readonly starredRepository: StarredRepository;

    constructor() {
        this.starredRepository = new StarredRepository()
    }

    insertStarred = (userId: string, fileId: string) => {
        return this.starredRepository.insertStarred(userId, fileId)
    }

}

export default StarredService;