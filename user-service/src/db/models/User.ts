'use strict';

import { sequelize } from "../../config/db";
import { DataTypes } from "sequelize";

const {
  Model
} = require('sequelize');


export interface UserAttributes {
  id?: string,
  fullName: string,
  email: string,
  password: string,
  profile_img: string;
  login_provider: string;
}

class User extends Model<UserAttributes> implements UserAttributes {
  declare id: string;
  declare fullName: string;
  declare email: string;
  declare password: string;
  declare profile_img: string;
  declare login_provider: string;
}

User.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    AllowNull: false
  },
  profile_img: {
    type: DataTypes.STRING,
    allowNull: true
  },
  login_provider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  limit: {
    type: DataTypes.INTEGER
  }
}, {
  sequelize,
  modelName: 'User',
});

export default User;