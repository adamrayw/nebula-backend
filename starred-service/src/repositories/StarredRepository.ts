import { Op } from "sequelize";
import Starred from "../db/models/Starred";

class StarredRepository {
  insertStarred = async (userId: string, fileId: string) => {
    const checkStarred = await Starred.findOne({
      where: {
        fileId: {
          [Op.eq]: fileId,
        },
      },
    });

    if (checkStarred) {
      return 409;
    }

    const insertToStarred = await Starred.create({
      userId,
      fileId,
    });

    return insertToStarred;
  };

  removeStarred = async (fileId: string) => {
    const checkStarred = await Starred.findOne({
      where: {
        fileId: {
          [Op.eq]: fileId,
        },
      },
    });

    if (!checkStarred) {
      return 404;
    }

    const removeToStarred = await Starred.destroy({
      where: {
        fileId,
      },
    });

    return removeToStarred;
  };

  getStarreds = async (userId: string, offset: string) => {
    const getStarredData = await Starred.findAndCountAll({
      raw: true,
      where: {
        userId,
      },
      limit: 10,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalFile = getStarredData.count;
    const lastPage = Math.ceil(totalFile / 10)

    return { getStarredData, totalFile, lastPage };
  };
}

export default StarredRepository;
