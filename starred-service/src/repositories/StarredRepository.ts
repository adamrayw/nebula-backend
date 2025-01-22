import { Op } from "sequelize";
import Starred from "../db/models/Starred";

class StarredRepository {

  findOne = async (fileId: string) => {
    const checkStarred = await Starred.findOne({
      where: {
        fileId: {
          [Op.eq]: fileId,
        },
      },
    });

    return checkStarred;
  };


  insertStarred = async (userId: string, fileId: string) => {
    return await Starred.create({
      userId,
      fileId,
    });

  };

  removeStarred = async (fileId: string) => {
    return await Starred.destroy({
      where: {
        fileId,
      },
    });
  };

  // untuk starred page
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

    return getStarredData;
  };

  // untuk my file page
  getStarredsMyFile = async (userId: string) => {
    const getStarredData = await Starred.findAll({
      where: {
        userId,
      },
    });

    return getStarredData;
  };
}

export default StarredRepository;
