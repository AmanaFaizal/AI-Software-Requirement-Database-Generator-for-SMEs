const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PurchaseItem = sequelize.define('PurchaseItem', {
  purchase_item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  purchase_id: {
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
  tableName: 'purchase_items',
  timestamps: false,
});

module.exports = PurchaseItem;
