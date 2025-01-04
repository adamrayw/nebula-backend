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

    getUserInfo = async (userId: string, token: string) => {
        try {
            // Ambil data user
            const user = await User.findByPk(userId);

            if (!user) {
                return null;
            }

            const response = await axios.get(`http://localhost:8080/api/file/totalFileSize/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                timeout: 5000
            }).catch((err) => {
                console.error("Failed to fetch file-service : ", err.errors)
                return {
                    data: {
                        data: 0
                    }
                }
            })

            // Gabungkan hasil user dengan total ukuran file
            return {
                ...user.toJSON(),
                totalFileSize: response.data.data,
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default UserRespository;