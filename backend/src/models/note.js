const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Note = sequelize.define('Note', {
  note_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  business_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: DataTypes.STRING(150),
  description: DataTypes.TEXT,
}, {
  tableName: 'notes',
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = Note;
