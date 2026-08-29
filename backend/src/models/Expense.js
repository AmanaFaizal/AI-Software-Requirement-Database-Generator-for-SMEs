const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define('Expense', {
  expense_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false, // e.g. Rent, Bill, Salary
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  expense_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
  description: {
    type: DataTypes.STRING(255),
  },
}, {
  tableName: 'expenses',
  timestamps: false,
});

module.exports = Expense;
