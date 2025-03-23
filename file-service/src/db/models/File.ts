'use strict';

import { sequelize } from "../../config/db";
import { DataType } from "sequelize-typescript";

const {
  Model
} = require('sequelize');

export interface FilesAttributes {
  id?: string;
  userId: string;
  originalname: string;
  mimetype: string;
  size: number;
  category: string;
  location: string;
  originalSize: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

class File extends Model<FilesAttributes> implements FilesAttributes {
  declare id: string;
  declare userId: string;
  declare originalname: string;
  declare mimetype: string;
  declare size: number;
  declare category: string;
  declare location: string;
  declare originalSize: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date;
}

File.init({
  id: {
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  },
  userId: {
    type: DataType.UUID,
  },
  originalName: {
    type: DataType.STRING,
  },
  mimeType: {
    type: DataType.STRING
  },
  size: {
    type: DataType.INTEGER
  },
  location: {
    type: DataType.STRING
  },
  categoryId: {
    type: DataType.UUID,
    defaultValue: null
  },
  deletedAt: {
    type: DataType.DATE,
    defaultValue: null
  },
}, {
  sequelize,
  modelName: 'File',
  timestamps: true
});

export default File;