const sequelize = require('../config');
const User = require('./User');
const Driver = require('./Drivers');
const Ride = require('./Rides');
const RideRequest = require('./RideRequests');
const Payment = require('./Payments');
const PendingRideQueue = require('./PendingRideQueue');

User.hasOne(Driver, { foreignKey: 'id' });
Driver.belongsTo(User, { foreignKey: 'id' });

User.hasMany(Ride, { foreignKey: 'client_id', as: 'clientRides' });
User.hasMany(Ride, { foreignKey: 'driver_id', as: 'driverRides' });
Ride.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
Ride.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

Ride.hasMany(RideRequest, { foreignKey: 'ride_id' });
RideRequest.belongsTo(Ride, { foreignKey: 'ride_id' });
User.hasMany(RideRequest, { foreignKey: 'driver_id' });
RideRequest.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

Ride.hasOne(Payment, { foreignKey: 'ride_id' });
Payment.belongsTo(Ride, { foreignKey: 'ride_id' });
User.hasMany(Payment, { foreignKey: 'client_id' });
Payment.belongsTo(User, { foreignKey: 'client_id' });

User.hasMany(Payment, { foreignKey: 'driver_id', as: 'driverPayments' });
Payment.belongsTo(User, { foreignKey: 'driver_id', as: 'driver' });

Ride.hasOne(PendingRideQueue, { foreignKey: 'ride_id' });
PendingRideQueue.belongsTo(Ride, { foreignKey: 'ride_id' });

module.exports = {
  sequelize,
  User,
  Driver,
  Ride,
  RideRequest,
  Payment,
  PendingRideQueue,
};
