import User, { UserAttributes } from "../db/models/User";

class AuthRepository {
    async create(data: UserAttributes): Promise<UserAttributes> {
        return await User.create(data)
    }

    async findUser(data: any): Promise<any> {
        return await User.findOne({
            where: {
                email: data.email
            }
        })
    }
}

export default AuthRepository;