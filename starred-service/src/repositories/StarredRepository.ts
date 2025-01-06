import { Op } from "sequelize";
import Starred from "../db/models/Starred";

class StarredRepository {

    insertStarred = async (userId: string, fileId: string) => {

        const checkStarred = await Starred.findOne({
            where: {
                fileId: {
                    [Op.eq]: fileId
                }
            }
        })

        if (checkStarred) {
            return 409
        }

        const insertToStarred = await Starred.create({
            userId,
            fileId
        })

        return insertToStarred;
    }

    removeStarred = async (fileId: string) => {

        const checkStarred = await Starred.findOne({
            where: {
                fileId: {
                    [Op.eq]: fileId
                }
            }
        })

        if (!checkStarred) {
            return 404
        }

        const removeToStarred = await Starred.destroy({
            where: {
                fileId
            }
        })

        return removeToStarred;
    }

    getStarreds = async (userId: string) => {
        const getStarredData = await Starred.findAll({
            where: {
                userId
            }
        })

        return getStarredData;
    }

}

export default StarredRepository;