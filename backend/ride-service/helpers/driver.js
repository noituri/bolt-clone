// helpers/driver.js
const { RideRequest, Driver } = require('../../db-schema/models');
const { Op } = require('sequelize');

/**
 * Znajduje pierwszego dostępnego kierowcę, który NIE odrzucił jeszcze danego kursu.
 * Naprawa: zamiast przestarzałego $notIn używamy Sequelize Op.notIn
 * i unikamy generowania zapytania z pustym NOT IN ().
 */
async function findAvailableDriver(rideId) {
    const rejected = await RideRequest.findAll({
        where: { ride_id: rideId, status: 'rejected' },
        attributes: ['driver_id'],
        raw: true,
    });
    const rejectedIds = rejected.map(r => r.driver_id);

    const where = { is_available: true };

    if (rejectedIds.length > 0) {
        where.id = { [Op.notIn]: rejectedIds };
    }

    const driver = await Driver.findOne({
        where,
        order: [['id', 'ASC']],
    });

    return driver || null;
}

module.exports = { findAvailableDriver };
