/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const Content = sequelize.define('contents', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subcategory_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  upload_method: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  video_length: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deleted'),
    defaultValue: 'active'
  },
  number_of_pages: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  is_featured: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: true,
  paranoid: true
});

export default Content