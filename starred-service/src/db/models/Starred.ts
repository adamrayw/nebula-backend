'use strict';

import { sequelize } from "../../config/db";
import { DataType } from "sequelize-typescript";

const {
  Model
} = require('sequelize');

interface StarredAttributes {
  id?: string;
  userId: string;
  fileId: string;
}

class Starred extends Model<StarredAttributes> implements StarredAttributes {
  public id?: string;
  public userId!: string;
  public fileId!: string;
}

Starred.init({
  id: {
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  },
  userId: {
    type: DataType.UUID
  },
  fileId: {
    type: DataType.UUID
  }
}, {
  sequelize,
  modelName: 'Starred',
});

export default Starred;