const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Invoice = sequelize.define('Invoice', {
  invoice_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purchase_id: {
    type: DataTypes.INTEGER, // If this invoice is for a purchase
    allowNull: true,
  },
  sale_id: {
    type: DataTypes.INTEGER, // If this invoice is for a sale
    allowNull: true,
  },
  invoice_number: {
    type: DataTypes.STRING(50),
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  issue_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'invoices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Invoice;
