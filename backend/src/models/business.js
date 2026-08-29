const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Business = sequelize.define('Business', {
  business_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  business_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  business_type: {
    type: DataTypes.STRING(100),
  },
}, {
  tableName: 'businesses',
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = Business;
