const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reminder = sequelize.define('Reminder', {
  reminder_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: DataTypes.STRING(150),
  reminder_date: DataTypes.DATEONLY,
  status: {
    type: DataTypes.ENUM('Pending', 'Completed'),
    defaultValue: 'Pending',
  },
}, {
  tableName: 'reminders',
  timestamps: false,
});

module.exports = Reminder;
