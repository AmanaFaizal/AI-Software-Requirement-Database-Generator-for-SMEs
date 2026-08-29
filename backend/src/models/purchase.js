const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Purchase = sequelize.define('Purchase', {
  purchase_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  supplier_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  purchase_date: DataTypes.DATEONLY,
  total_amount: DataTypes.DECIMAL(10, 2),
  is_ordered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_delivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'purchases',
  timestamps: false,
});

module.exports = Purchase;
