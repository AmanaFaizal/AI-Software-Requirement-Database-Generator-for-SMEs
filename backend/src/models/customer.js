const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Customer = sequelize.define('Customer', {
  customer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  customer_name: DataTypes.STRING(150),
  phone: DataTypes.STRING(20),
  address: DataTypes.TEXT,
}, {
  tableName: 'customers',
  timestamps: false,
});

module.exports = Customer;
