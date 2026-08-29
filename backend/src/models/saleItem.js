const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SaleItem = sequelize.define('SaleItem', {
  sale_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: DataTypes.INTEGER,
  price: DataTypes.DECIMAL(10, 2),
}, {
  tableName: 'sale_items',
  timestamps: false,
});

module.exports = SaleItem;
