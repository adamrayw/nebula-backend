import File, { FilesAttributes } from '../db/models/File';
import { Op } from 'sequelize';

class UploadRespository {
    upload = async (data: FilesAttributes) => {
        return await File.create({
            mimeType: data.mimetype,
            size: (data.size === 0 ? data.originalSize : data.size),
            originalName: data.originalname,
            location: data.location,
            userId: data.userId
        })
    }

    getAllFiles = async (userId: string, search: string, offset: string) => {

        const whereClause: any = {
            userId
        }

        if (search) {
            whereClause.originalName = {
                [Op.iLike]: `%${search}%`
            }
        }

        const totalFile = await File.findAndCountAll({
            where: whereClause
        })

        const lastPage = Math.ceil(totalFile.count / 10)

        const data = await File.findAll({
            where: whereClause,
            limit: 10,
            offset,
            order: [
                [
                    'createdAt', 'DESC'
                ]
            ]
        });

        return {
            data,
            lastPage,
            totalFile
        }
    }

    deleteFile = async (fileId: string) => {
        return await File.destroy({
            where: {
                id: fileId
            }
        })
    }

    totalFileSize = async (userId: string) => {
        const totalFile = await File.sum('size', { where: { userId } })

        return totalFile
    }

    insertStarred = async (userId: string, fileId: string) => {
        const insertToStarred = await File.create({
            userId,
            fileId
        })

        return insertToStarred;
    }
}

export default UploadRespository;