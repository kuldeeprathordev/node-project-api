/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import Category from './Category.js';

const CategoryTranslation = sequelize.define('category_translations', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lang: {
    type: DataTypes.ENUM('en', 'ar'),
    allowNull: false,
    defaultValue: 'en',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
}, {
  timestamps: true, // Required for paranoid
  paranoid: true,
});

export default CategoryTranslation;