import UserRespository from "../repositories/UserRepository";

class UserService {
    private readonly userRepository: UserRespository;

    constructor() {
        this.userRepository = new UserRespository()
    }

    getUserInfo(userId: string, token: string) {
        return this.userRepository.getUserInfo(userId, token)
    }

    getLimit(userId: string) {
        return this.userRepository.getLimit(userId)
    }

}

export default UserService;