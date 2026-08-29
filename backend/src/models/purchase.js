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
  purchase_date: DataTypes.DATEONLY,
  total_amount: DataTypes.DECIMAL(10, 2),
}, {
  tableName: 'purchases',
  timestamps: false,
});

module.exports = Purchase;
