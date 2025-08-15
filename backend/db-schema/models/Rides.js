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

  // === New fields for OSRM integration ===
  from_lat: {
    type: DataTypes.DECIMAL(10, 7), // ~ accuracy to ~1cm
    allowNull: false
  },
  from_lon: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  to_lat: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  to_lon: {
    type: DataTypes.DECIMAL(10, 7),
    allowNull: false
  },
  distance: {
    type: DataTypes.FLOAT, // meters
    allowNull: true
  },
  duration: {
    type: DataTypes.FLOAT, // seconds
    allowNull: true
  },
  geometry: {
    type: DataTypes.TEXT, // geojson string
    allowNull: true
  },
  // === End of new fields ===

  amount: {
    type: DataTypes.DECIMAL(8, 2),
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
