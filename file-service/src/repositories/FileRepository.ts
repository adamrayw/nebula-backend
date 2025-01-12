import File, { FilesAttributes } from "../db/models/File";
import { Op } from "sequelize";
import axios from "axios";

class UploadRespository {
  upload = async (data: FilesAttributes) => {
    return await File.create({
      mimeType: data.mimetype,
      size: data.size === 0 ? data.originalSize : data.size,
      originalName: data.originalname,
      location: data.location,
      userId: data.userId,
    });
  };

  getAllFiles = async (
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

    const totalFile = await File.findAndCountAll({
      where: whereClause,
    });

    const getStarredFile = await axios.get(
      `http://localhost:8082/api/file/starred/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const starredData = getStarredFile.data.data;

    const lastPage = Math.ceil(totalFile.count / 10);

    let data = await File.findAll({
      raw: true,
      where: whereClause,
      limit: 10,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // merging file and starred data
    data = data.map((file: FilesAttributes) => ({
      ...file,
      starred:
        starredData.find(
          (star: { fileId: string }) => star.fileId === file.id
        ) || null,
    }));

    return {
      data,
      lastPage,
      totalFile,
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
      `http://localhost:8082/api/file/starred/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const starredData = getStarredFile.data.data;

    
    let data = await File.findAll({
      raw: true,
      where: whereClause,
      limit: 10,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // merging file and starred data
    data = data.map((file: FilesAttributes) => ({
      ...file,
      starred:
      starredData.find(
          (star: { fileId: string }) => star.fileId === file.id
        ) || null,
    }));

    // Tampilkan jika hanya dibintangi saja
    data = data.filter(
      (file: FilesAttributes & { starred: any }) => file.starred !== null
    );
    
    const totalFile = data.length

    const lastPage = Math.ceil(totalFile / 10);

    return {
      data,
      lastPage,
      totalFile,
    };
  };

  deleteFile = async (fileId: string) => {
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
}

export default UploadRespository;
