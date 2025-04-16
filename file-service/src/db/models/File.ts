'use strict';

import { sequelize } from "../../config/db";
import { DataType } from "sequelize-typescript";
import Folder from "./Folder";
import Category from "./Category";

import { Model } from 'sequelize';

export interface FilesAttributes {
  id?: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  categoryId: string;
  location: string;
  originalSize?: number;
  folderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

class File extends Model<FilesAttributes> implements FilesAttributes {
  declare id: string;
  declare userId: string;
  declare originalName: string;
  declare mimeType: string;
  declare size: number;
  declare categoryId: string;
  declare location: string;
  declare originalSize?: number | undefined; 
  declare folderId?: string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare deletedAt?: Date | null;
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
    defaultValue: null,
  },
  folderId: {
    type: DataType.UUID,
    allowNull: true,
    defaultValue: null
  },
  deletedAt: {
    type: DataType.DATE,
    defaultValue: null,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'File',
  timestamps: true
});

export default File;