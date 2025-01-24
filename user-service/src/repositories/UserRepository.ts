import axios from 'axios';
import User from '../db/models/User';

class UserRespository {
    getLimit = async (userId: string) => {
        return await User.findOne({
            where: {
                id: userId
            },
            attributes: ['limit']
        })
    }

    getUserById = async (userId: string) => {
        return await User.findByPk(userId);
    }

    getUserInfo = async (userId: string, token: string) => {
        // request ke file-service untuk mendapatkan total ukuran file
        const response = await axios.get(`http://localhost:8080/api/file/totalFileSize/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            },
            timeout: 5000
        }).catch((err) => {
            console.error("Failed to fetch file-service : ", err.message)
            throw new Error("File service is unreachable");
        })

        return {
            totalFileSize: response.data.data,
        };
    }

    updateLimit = async (userId: string, limit: number) => {
        const getCurrentLimit = await this.getLimit(userId);

        return await User.update({
            limit: Number(getCurrentLimit.limit) + Number(limit)
        }, {
            where: {
                id: userId
            }
        })
    }
}

export default UserRespository;