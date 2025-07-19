const { RideRequest, Driver } = require('../db-schema/models');

async function findAvailableDriver(rideId) {
    const rejectedRequests = await RideRequest.findAll({
        where: { ride_id: rideId, status: 'rejected' },
        attributes: ['driver_id'],
    });
    const rejectedIds = rejectedRequests.map(r => r.driver_id);
    return await Driver.findOne({
        where: {
            is_available: true,
            id: { $notIn: rejectedIds },
        }
    });
}

module.exports = { findAvailableDriver };