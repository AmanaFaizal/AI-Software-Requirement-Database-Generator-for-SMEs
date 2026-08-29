const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Supplier = sequelize.define('Supplier', {
  supplier_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  supplier_name: DataTypes.STRING(150),
  shop_name: DataTypes.STRING(150),
  phone: DataTypes.STRING(20),
  address: DataTypes.TEXT,
}, {
  tableName: 'suppliers',
  timestamps: false,
});

module.exports = Supplier;
