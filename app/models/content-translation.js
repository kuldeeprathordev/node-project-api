/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';
import { content } from './index.js';

const ContentTranslation = sequelize.define('content-translations', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lang: {
    type: DataTypes.ENUM('en', 'ar'),
    allowNull: false,
    defaultValue: 'en',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  coach_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: false,
  paranoid: true
});

export default ContentTranslation