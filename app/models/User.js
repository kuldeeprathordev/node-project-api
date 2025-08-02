import { DataTypes } from 'sequelize';
import sequelize from '../../config/database.js';

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING
  },
  middle_name: {
    type: DataTypes.STRING
  },
  last_name: {
    type: DataTypes.STRING
  },
   username: {
    type: DataTypes.STRING,
        unique: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  country_code: {
    type: DataTypes.STRING
  },
  contact_number: {
    type: DataTypes.STRING
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: null
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'unspecified'),
    defaultValue: 'unspecified'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  first_login_at: {
    type: DataTypes.DATE
  },
  last_login_at: {
    type: DataTypes.DATE
  },
  forgot_password_code: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'deleted'),
    defaultValue: 'active'
  }
}, {
  timestamps: false,
  paranoid: true
});

export default User