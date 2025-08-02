/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import CategoryTranslation from './Category-translation.js';

const Category = sequelize.define('categories', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    },
    cover_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    banner_image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
  timestamps: false,
  paranoid: true
});

Category.hasMany(CategoryTranslation, {
  foreignKey: 'category_id',
  as: 'translations'
});

CategoryTranslation.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});


export default Category