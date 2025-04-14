'use strict';

import { sequelize } from "../../config/db";
import { DataType } from "sequelize-typescript";

import { Model } from 'sequelize';

export interface FolderAttributes {
  id?: string;
  name: string;
  userId: string;
  parentId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class Folder extends Model<FolderAttributes> implements FolderAttributes {
  public name!: string;
  public parentId!: string | null;
  public userId!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Folder.init({
  id: {
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  },
  name: {
    type: DataType.STRING,
    allowNull: false
  },
  parentId: {
    type: DataType.UUID,
    allowNull: true,
    defaultValue: null
  },
  userId: {
    type: DataType.UUID,
    allowNull: false
  },
  createdAt: {
    type: DataType.DATE,
    defaultValue: DataType.NOW
  },
  updatedAt: {
    type: DataType.DATE,
    defaultValue: DataType.NOW
  }
}, {
  sequelize,
  modelName: 'Folder',
});

export default Folder;