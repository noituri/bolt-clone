const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ride_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Rides',
      key: 'id'
    }
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(8,2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  method: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reference: {
    type: DataTypes.STRING(64),
    allowNull: true
  }
}, {
  timestamps: false
});

module.exports = Payment;
