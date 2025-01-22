import UserRespository from "../repositories/UserRepository";

class UserService {
    private readonly userRepository: UserRespository;

    constructor() {
        this.userRepository = new UserRespository()
    }

    async getUserInfo(userId: string, token: string) {
        const findUser = await this.userRepository.getUserById(userId)

        if (!findUser) {
            throw new Error('User not found')
        }

        let { totalFileSize } = await this.userRepository.getUserInfo(userId, token)

        const { limit } = await this.getLimit(userId)

        return {
            limit,
            totalFileSize
        }
    }

    getLimit(userId: string) {
        return this.userRepository.getLimit(userId)
    }

    updateLimit(userId: string, limit: number) {
        return this.userRepository.updateLimit(userId, limit)
    }

}

export default UserService;