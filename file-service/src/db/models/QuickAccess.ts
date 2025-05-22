'use strict';

import { sequelize } from "../../config/db";
import { DataType } from "sequelize-typescript";

import { Model } from 'sequelize';

export interface QuickAccessAttributes {
  id?: string;
  userId: string;
  targetId: string;
  type?: string;
  pinnedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class QuickAccess extends Model<QuickAccessAttributes> implements QuickAccessAttributes {
  public id!: string;
  public userId!: string;
  public targetId!: string;
  public type!: string;
  public pinnedAt!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;

}

QuickAccess.init({
  id: {
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  },
  userId: {
    type: DataType.UUID,
    allowNull: false
  },
  targetId: {
    type: DataType.UUID,
    allowNull: false
  },
  type: {
    type: DataType.ENUM('folder', 'file'),
    allowNull: true
  },
  pinnedAt: {
    type: DataType.DATE,
    defaultValue: DataType.NOW
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
  modelName: 'QuickAccess',
  tableName: 'QuickAccess', // Specify the table name if different from the model name
  timestamps: true, // Enable timestamps for createdAt and updatedAt fields
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['targetId']
    }
  ]
});

export default QuickAccess;