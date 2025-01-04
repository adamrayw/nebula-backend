import { UserAttributes } from "../db/models/User";
import AuthRepository from "../repositories/AuthRepository";

class AuthService {
    private readonly authRepository: AuthRepository;

    constructor() {
        this.authRepository = new AuthRepository();
    }

    async createUser(data: UserAttributes) {
        return this.authRepository.create(data)
    }

    async findUser(data: any) {
        return this.authRepository.findUser(data)
    }
}

export default AuthService;