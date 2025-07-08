const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Ride = sequelize.define('Ride', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  driver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  from_address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  to_address: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(8,2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'accepted', 'completed', 'canceled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  requested_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  accepted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  finished_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: false
});

module.exports = Ride;
