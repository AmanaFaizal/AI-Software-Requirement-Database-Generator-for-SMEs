const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
  },
  dealer_id: {
    type: DataTypes.INTEGER,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  cost_price: {
    type: DataTypes.DECIMAL(10, 2),
  },
  selling_price: {
    type: DataTypes.DECIMAL(10, 2),
  },
}, {
  tableName: 'products',
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = Product;
