const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Driver = sequelize.define('Driver', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  car_make: {
    type: DataTypes.STRING(50)
  },
  car_model: {
    type: DataTypes.STRING(50)
  },
  car_plate: {
    type: DataTypes.STRING(20)
  }
}, {
  timestamps: false
});

module.exports = Driver;
