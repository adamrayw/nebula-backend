import StarredRepository from "../repositories/StarredRepository";

class StarredService {
    private readonly starredRepository: StarredRepository;

    constructor() {
        this.starredRepository = new StarredRepository()
    }

    getStarreds = async (userId: string, offset: string) => {
        const getStarredData = await this.starredRepository.getStarreds(userId, offset)

        const totalFile = getStarredData.count;
        const lastPage = Math.ceil(totalFile / 10)

        return {
            getStarredData,
            totalFile,
            lastPage
        }
    }

    getStarredsMyFile = (userId: string) => {
        return this.starredRepository.getStarredsMyFile(userId)
    }

    insertStarred = async (userId: string, fileId: string) => {
        const checkStarred = await this.starredRepository.findOne(fileId)

        if (checkStarred) {
            return 409;
        }

        const insertToStarred = await this.starredRepository.insertStarred(userId, fileId)

        return insertToStarred
    }

    removeStarred = async (fileId: string) => {
        const checkStarred = await this.starredRepository.findOne(fileId)

        if (!checkStarred) {
            return 404;
        }

        const removeFromStarred = await this.starredRepository.removeStarred(fileId)

        return removeFromStarred;
    }

}

export default StarredService;