/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const videoViews = sequelize.define('video-viewses', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  video_id: {
   type: DataTypes.INTEGER,
    allowNull: false 
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  click_count: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false,
  paranoid: true
});


export default videoViews