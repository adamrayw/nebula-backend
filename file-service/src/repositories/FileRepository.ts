import File, { FilesAttributes } from "../db/models/File";
import { Op, QueryTypes, Sequelize, where } from "sequelize";
import axios from "axios";
import Category, { CategoryAttributes } from "../db/models/Category";
import { sendToQueue } from "../services/producer";
import { deleteObject } from "../config/s3";
import { sequelize } from "../config/db";
import Folder from "../db/models/Folder";

class UploadRespository {
  upload = async (data: FilesAttributes) => {
    // find category id

    // const findCategoryId = await Category.findOne({
    //   raw: true,
    //   where: {
    //     slug: data.category
    //   }
    // })

    const findCategoryId = await sequelize.query<CategoryAttributes>(`SELECT * FROM "Categories" WHERE slug = :slug LIMIT 1`, {
      type: QueryTypes.SELECT,
      replacements: { slug: data.categoryId }
    });

    const createFile = await File.create({
      mimeType: data.mimeType,
      size: data.size === 0 ? (data.originalSize || 0) : (data.size || 0),
      originalName: data.originalName,
      location: data.location,
      userId: data.userId,
      categoryId: findCategoryId[0].id as string, 
    });

    if (createFile) {
      await sendToQueue(JSON.stringify({
        pattern: 'activity_queue',
        data: {
          userId: data.userId,
          type: 'upload',
          description: `Anda mengupload file ${data.originalName}`,
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
    let whereClause: any = {
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

    let data: FilesAttributes[] = await File.findAll({
      raw: true,
      where: {
        deletedAt: null,
        ...whereClause
      },
      limit: 10,
      offset: parseInt(offset),
      order: [[sortBy as string, (sortOrder || 'asc') as string]],
    });

    return {
      data: data as FilesAttributes[],
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
      offset: parseInt(offset),
    });

    return {
      data,
      starredData,
      getStarredFile,
    };
  };

  deleteFile = async (fileId: string, token: string, offset: number, type: string) => {
    const deleteStarred = await axios.delete(`http://localhost:8082/api/file/starred/${fileId}?offset=${offset}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).catch((err) => {
      console.error("Failed to delete starred-service : ", err.message)
      throw new Error("Starred service is unreachable");
    })

    if (deleteStarred.status !== 200) {
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
        userId: file?.userId,
        type: 'delete',
        description: `Anda menghapus file ${file?.originalName}`,
      },
    }));

    if (type === 'delete') {
      return await File.destroy({
        where: {
          id: fileId,
        },
      });
    } else {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      return await File.update({
        deletedAt: oneMonthFromNow,
      }, {
        where: {
          id: fileId,
        },
      });
    }
  };

  totalFileSize = async (userId: string) => {
    const totalFile = await File.sum("size", { where: { userId } });

    return totalFile;
  };

  getCategories = async (userId: string) => {
    const categories = await Category.findAll({
      include: [{
        model: File,
        as: 'files',
        where: {
          userId,
        },
        required: false,
      }]
    })

    return categories
  }

  getTrashFile = async (userId: string) => {
    const trashFiles = await File.findAll({
      where: {
        userId,
        deletedAt: {
          [Op.ne]: new Date(0) || null,
        }
      }
    })

    return trashFiles
  }

  undoTrashFile = async (fileId: string) => {
    const undoTrash = await File.update(
      {
        deletedAt: new Date(0) || null,
      },
      {
        where: {
          id: fileId,
        },
      }
    );

    return undoTrash;
  }

  deleteExpiredFiles = async () => {
    const thirsyDaysAgo = new Date();
    thirsyDaysAgo.setDate(thirsyDaysAgo.getDate() - 30);

    const expiredFiles = await File.findAll({
      where: {
        deletedAt: {
          [Op.lt]: thirsyDaysAgo,
        }
      }
    })

    if (expiredFiles.length === 0) {
      console.log("✅ No expired files found");
      return;
    }

    for (const file of expiredFiles) {
      await deleteObject(file.location);
      await File.destroy({
        where: {
          id: file.id
        }
      });
    }

    console.log(`🗑 Deleted ${expiredFiles.length} expired files`);
  }

  getFolders = async (userId: string) => {
    const folders = await Folder.findAll({
      where: {
        userId,
        parentId: null,
      }
    })

    return folders
  }

  createFolder = async (userId: string, folderName: string, parentId: string) => {
    const folder = await Folder.create({
      userId,
      name: folderName,
      parentId: parentId || null,
    })

    return folder
  }

  getFilesByFolderId = async (folderId: string) => {
    const folders = await Folder.findAll({
      where: {
        parentId: folderId,
      }
    })

    const files = await Folder.findOne({
      where: {
        id: folderId,
      },
      include: [{
        model: File,
        as: 'files',
        where: {
          folderId: folderId,
          deletedAt: null,
        },
        required: false,
      }],
    })

    return {
      folders,
      files,
    }
  }
}

export default UploadRespository;
