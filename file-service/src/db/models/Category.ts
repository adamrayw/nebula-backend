'use strict';

import { sequelize } from "../../config/db";
import { DataType } from "sequelize-typescript";
import File from "./File";

const {
  Model
} = require('sequelize');

export interface CategoryAttributes {
  id?: string;
  slug: string;
  name: string;
}

class Category extends Model {
  public slug!: string;
  public name!: string;
}

Category.init({
  id: {
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  },
  slug: {
    type: DataType.STRING,
    allowNull: false
  },
  name: {
    type: DataType.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Category',
});

Category.hasMany(File, {
  foreignKey: 'categoryId'
})


export default Category;