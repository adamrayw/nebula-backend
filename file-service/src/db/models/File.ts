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
  location: string;
  originalSize: number;
}

class File extends Model<FilesAttributes> implements FilesAttributes {
  public id?: string;
  public userId!: string;
  public originalname!: string;
  public mimetype!: string;
  public size!: number;
  public location!: string;
  public originalSize!: number;

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
  }
}, {
  sequelize,
  modelName: 'File',
});

export default File;