import File, { FilesAttributes } from "../db/models/File";
import { Op } from "sequelize";
import axios from "axios";
import Category from "../db/models/Category";
import { sendToQueue } from "../services/producer";

class UploadRespository {
  upload = async (data: FilesAttributes) => {
    // find category id

    const findCategoryId = await Category.findOne({
      raw: true,
      where: {
        slug: data.category
      }
    })

    const createFile = await File.create({
      mimeType: data.mimetype,
      size: data.size === 0 ? data.originalSize : data.size,
      originalName: data.originalname,
      location: data.location,
      userId: data.userId,
      categoryId: findCategoryId.id
    });

    if (createFile) {
      await sendToQueue(JSON.stringify({
        pattern: 'activity_queue',
        data: {
          userId: data.userId,
          type: 'upload',
          description: `Anda mengupload file ${data.originalname}`,
        },
      }));
    }

    return createFile
  };


  getAllFiles = async (
    userId: string,
    search: string,
    offset: string,
    token: string,
    sortBy: string,
    sortOrder: string
  ) => {
    const whereClause: any = {
      userId,
    };

    if (search) {
      whereClause.originalName = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const totalFile = await File.findAndCountAll({
      where: whereClause,
    });

    const getStarredFile = await axios.get(
      `http://localhost:8082/api/file/starredMyFiles`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).catch((err) => {
      console.error("Failed to fetch starred-service : ", err.message)
      throw new Error("Starred service is unreachable");
    })

    const starredData = getStarredFile.data.data;

    let data = await File.findAll({
      raw: true,
      where: whereClause,
      limit: 10,
      offset,
      order: [[sortBy as string, (sortOrder || 'asc') as string]],
    });

    return {
      data,
      totalFile,
      starredData,
    };
  };

  getStarredFiles = async (
    userId: string,
    search: string,
    offset: string,
    token: string
  ) => {
    const whereClause: any = {
      userId,
    };

    if (search) {
      whereClause.originalName = {
        [Op.iLike]: `%${search}%`,
      };
    }

    // const totalFile = await File.findAndCountAll({
    //   where: whereClause,
    // });

    const getStarredFile = await axios.get(
      `http://localhost:8082/api/file/starred?offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const starredData = getStarredFile.data.data;

    let data = await File.findAndCountAll({
      raw: true,
      where: whereClause,
      // limit: 10,
      offset,
    });

    return {
      data,
      starredData,
      getStarredFile,
    };
  };

  deleteFile = async (fileId: string, token: string) => {
    const deleteStarred = await axios.delete('http://localhost:8082/api/file/starred/' + fileId, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).catch((err) => {
      console.error("Failed to delete starred-service : ", err.message)
      throw new Error("Starred service is unreachable");
    })

    if(deleteStarred.status !== 200) {
      throw new Error("Failed to delete starred-service")
    }

    // get file for user id
    const file = await File.findOne({
      raw: true,
      where: {
        id: fileId,
      },
    });

    await sendToQueue(JSON.stringify({
      pattern: 'activity_queue',
      data: {
        userId: file.userId,
        type: 'delete',
        description: `Anda menghapus file ${file.originalName}`,
      },
    }));

    return await File.destroy({
      where: {
        id: fileId,
      },
    });
  };

  totalFileSize = async (userId: string) => {
    const totalFile = await File.sum("size", { where: { userId } });

    return totalFile;
  };

  getCategories = async (userId: string) => {
    const categories = await Category.findAll({
      include: {
        model: File,
        required: false,
        where: {
          userId
        }
      }
    })

    return categories
  }
}

export default UploadRespository;
