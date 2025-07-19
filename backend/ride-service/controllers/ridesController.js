const { Ride, RideRequest, User, Driver } = require('../db-schema/models');
const { canAccessRide, isDriver, isClient } = require('../helpers/permissions');

// Helper to find the next available driver (ignoring those who already rejected)
async function findAvailableDriver(rideId) {
    // Get drivers who rejected this ride
    const rejectedRequests = await RideRequest.findAll({
        where: { ride_id: rideId, status: 'rejected' },
        attributes: ['driver_id'],
    });
    const rejectedIds = rejectedRequests.map(r => r.driver_id);

    // Find next available driver not in rejectedIds
    return await Driver.findOne({
        where: {
            is_available: true,
            id: { $notIn: rejectedIds },
        }
    });
}

module.exports = {
    // Client requests a ride
    requestRide: async (req, res) => {
        try {
            if (!isClient(req.user)) return res.status(403).json({ error: 'Only clients can request rides.' });
            const { from_address, to_address, amount } = req.body;
            if (!from_address || !to_address || !amount) {
                return res.status(400).json({ error: 'Missing ride parameters.' });
            }

            // Create ride
            const ride = await Ride.create({
                client_id: req.user.id,
                from_address,
                to_address,
                amount,
                status: 'pending',
                requested_at: new Date()
            });

            // Assign first available driver
            const driver = await Driver.findOne({ where: { is_available: true } });
            if (!driver) {
                await ride.update({ status: 'canceled' });
                return res.status(200).json({ message: 'No drivers available.', ride });
            }

            // Create RideRequest for this driver
            await RideRequest.create({
                ride_id: ride.id,
                driver_id: driver.id,
                status: 'pending',
                requested_at: new Date()
            });

            await ride.update({ status: 'assigned', driver_id: driver.id });
            res.json({ message: 'Ride requested and assigned to a driver.', ride });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Get ride history for current user
    rideHistory: async (req, res) => {
        try {
            let rides;
            if (isClient(req.user)) {
                rides = await Ride.findAll({ where: { client_id: req.user.id } });
            } else if (isDriver(req.user)) {
                rides = await Ride.findAll({ where: { driver_id: req.user.id } });
            } else {
                // For admins, return all rides
                rides = await Ride.findAll();
            }
            res.json(rides);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // List available rides for driver
    availableRides: async (req, res) => {
        try {
            if (!isDriver(req.user)) return res.status(403).json({ error: 'Only drivers can see available rides.' });

            // Get rides assigned to this driver that are pending acceptance
            const rideRequests = await RideRequest.findAll({
                where: { driver_id: req.user.id, status: 'pending' }
            });

            const rideIds = rideRequests.map(r => r.ride_id);
            const rides = await Ride.findAll({ where: { id: rideIds } });
            res.json(rides);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // List assigned (active) rides for driver
    assignedRides: async (req, res) => {
        try {
            if (!isDriver(req.user)) return res.status(403).json({ error: 'Only drivers can see assigned rides.' });
            const rides = await Ride.findAll({
                where: { driver_id: req.user.id, status: ['assigned', 'accepted'] }
            });
            res.json(rides);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Get single ride details (with permission check)
    getRide: async (req, res) => {
        try {
            const { id } = req.params;
            const ride = await Ride.findByPk(id);
            if (!ride) return res.status(404).json({ error: 'Ride not found.' });

            if (!canAccessRide(req.user, ride)) return res.status(403).json({ error: 'Forbidden.' });
            res.json(ride);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Cancel a ride (only client who ordered it or admin)
    cancelRide: async (req, res) => {
        try {
            const { id } = req.params;
            const ride = await Ride.findByPk(id);
            if (!ride) return res.status(404).json({ error: 'Ride not found.' });
            if (!(req.user.role === 'admin' || (isClient(req.user) && ride.client_id === req.user.id))) {
                return res.status(403).json({ error: 'Forbidden.' });
            }
            if (ride.status === 'completed' || ride.status === 'canceled') {
                return res.status(400).json({ error: 'Cannot cancel this ride.' });
            }
            await ride.update({ status: 'canceled' });
            res.json({ message: 'Ride canceled.' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Accept ride (driver)
    acceptRide: async (req, res) => {
        try {
            const { id } = req.params;
            if (!isDriver(req.user)) return res.status(403).json({ error: 'Only drivers can accept rides.' });

            const ride = await Ride.findByPk(id);
            if (!ride) return res.status(404).json({ error: 'Ride not found.' });

            const request = await RideRequest.findOne({
                where: { ride_id: ride.id, driver_id: req.user.id, status: 'pending' }
            });
            if (!request) return res.status(400).json({ error: 'No pending request for this driver.' });

            await request.update({ status: 'accepted', responded_at: new Date() });
            await ride.update({ status: 'accepted', accepted_at: new Date() });
            res.json({ message: 'Ride accepted.' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // Reject ride (driver)
    rejectRide: async (req, res) => {
        try {
            const { id } = req.params;
            if (!isDriver(req.user)) return res.status(403).json({ error: 'Only drivers can reject rides.' });

            const ride = await Ride.findByPk(id);
            if (!ride) return res.status(404).json({ error: 'Ride not found.' });

            const request = await RideRequest.findOne({
                where: { ride_id: ride.id, driver_id: req.user.id, status: 'pending' }
            });
            if (!request) return res.status(400).json({ error: 'No pending request for this driver.' });

            await request.update({ status: 'rejected', responded_at: new Date() });

            const nextDriver = await findAvailableDriver(ride.id);

            if (nextDriver) {
                await RideRequest.create({
                    ride_id: ride.id,
                    driver_id: nextDriver.id,
                    status: 'pending',
                    requested_at: new Date()
                });
                await ride.update({ driver_id: nextDriver.id, status: 'assigned' });
                return res.json({ message: 'Ride offered to next available driver.' });
            } else {
                await ride.update({ status: 'canceled' });
                return res.json({ message: 'No drivers available, ride canceled.' });
            }
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },
};
