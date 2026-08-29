const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Sale = sequelize.define('Sale', {
  sale_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_id: DataTypes.INTEGER,
  sale_date: DataTypes.DATEONLY,
  total_amount: DataTypes.DECIMAL(10, 2),
}, {
  tableName: 'sales',
  timestamps: false,
});

module.exports = Sale;
