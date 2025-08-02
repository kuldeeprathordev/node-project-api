/**
 * @author "Abdul Quadir Dewaswala"
 * @license MIT
 * @version 1.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const CustomerDetail = sequelize.define('customer_details', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  paranoid: true
});

(async () => {
  await sequelize.sync();
})();

export default CustomerDetail