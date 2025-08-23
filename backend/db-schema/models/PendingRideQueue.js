const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const PendingRideQueue = sequelize.define('PendingRideQueue', {
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
        },
        unique: true
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
});

PendingRideQueue.associate = function (models) {
    PendingRideQueue.belongsTo(models.Ride, { foreignKey: 'ride_id' });
};

module.exports = PendingRideQueue;