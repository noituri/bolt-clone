const { Ride, RideRequest, User, Driver, PendingRideQueue } = require('../../db-schema/models');
const queueService = require('../services/queueService');
const { canAccessRide, isDriver, isClient } = require('../helpers/permissions');
const { findAvailableDriver } = require('../helpers/driver');
const { validateRideData } = require('../helpers/validation');
const { getRouteInfo } = require('../helpers/osrm');
const { Op } = require('sequelize');
const axios = require('axios');
const paymentApi = require('../services/paymentApi');
module.exports = {

    requestRide: async (req, res) => {
        try {
            if (!isClient(req.user)) {
                return res.status(403).json({ error: 'Only clients can request rides.' });
            }

            const {
                from_lat, from_lon,
                to_lat, to_lon,
                from_address, to_address
            } = req.body;

            // Walidacja obecności pól
            if (
                from_lat == null || from_lon == null ||
                to_lat == null || to_lon == null ||
                !from_address || !to_address
            ) {
                return res.status(400).json({ error: 'Coordinates and addresses are required' });
            }

            // Upewnij się, że przekazujemy liczby do OSRM i bazy
            const fFromLat = parseFloat(from_lat);
            const fFromLon = parseFloat(from_lon);
            const fToLat = parseFloat(to_lat);
            const fToLon = parseFloat(to_lon);

            if ([fFromLat, fFromLon, fToLat, fToLon].some(Number.isNaN)) {
                return res.status(400).json({ error: 'Invalid coordinates' });
            }

            // Trasa z OSRM
            const routeInfo = await getRouteInfo(
                { lat: fFromLat, lon: fFromLon },
                { lat: fToLat, lon: fToLon }
            );

            const pricePerKm = 5;
            const amount = Math.round((routeInfo.distance / 1000) * pricePerKm * 100) / 100;

            // Tworzymy ride zawsze jako pending
            const ride = await Ride.create({
                client_id: req.user.id,
                from_address,
                to_address,
                from_lat: fFromLat,
                from_lon: fFromLon,
                to_lat: fToLat,
                to_lon: fToLon,
                distance: routeInfo.distance,
                duration: routeInfo.duration,
                geometry: JSON.stringify(routeInfo.geometry),
                amount,
                status: 'pending',
                requested_at: new Date()
            });

            await paymentApi.post('/', {
                ride_id: ride.id,
                client_id: req.user.id,
                amount,
                method: req.body.method,
                status: 'pending'
            });


            // Spróbuj znaleźć kierowcę; jeśli brak – dodaj do kolejki
            const driver = await findAvailableDriver(ride.id);
            if (!driver) {
                try {
                    await PendingRideQueue.create({
                        ride_id: ride.id,
                        priority: 0
                    });
                } catch (err) {
                    console.error('Error adding to queue:', err);
                    // Możesz tutaj obsłużyć błąd, np. usunąć ride jeśli nie udało się dodać do kolejki
                }

                return res.status(201).json({
                    message: 'Ride requested. Waiting for a driver.',
                    ride
                });
            }

            // Przydział do kierowcy
            await RideRequest.create({
                ride_id: ride.id,
                driver_id: driver.id,
                status: 'pending',
                requested_at: new Date()
            });

            await ride.update({ status: 'assigned', driver_id: driver.id });

            res.status(201).json({
                message: 'Ride requested and assigned to a driver.',
                ride
            });

            // Po odpowiedzi – oznacz kierowcę jako zajętego
            await Driver.update({ is_available: false }, { where: { id: driver.id } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },




    routeInfo: async (req, res) => {
        try {
            const { from_lat, from_lon, to_lat, to_lon } = req.query;
            if (!from_lat || !from_lon || !to_lat || !to_lon) {
                return res.status(400).json({ error: 'Coordinates are required' });
            }

            const routeInfo = await getRouteInfo(
                { lat: parseFloat(from_lat), lon: parseFloat(from_lon) },
                { lat: parseFloat(to_lat), lon: parseFloat(to_lon) }
            );

            const pricePerKm = 5;
            const amount = (routeInfo.distance / 1000 * pricePerKm).toFixed(2);

            res.status(200).json({
                distance: routeInfo.distance,
                duration: routeInfo.duration,
                amount,
                geometry: routeInfo.geometry
            });
        } catch (err) {
            console.error(err);
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
                rides = await Ride.findAll();
            }
            res.status(200).json(rides);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // List available rides for driver
    availableRides: async (req, res) => {
        try {
            if (!isDriver(req.user)) {
                return res.status(403).json({ error: 'Only drivers can see available rides.' });
            }

            const rideRequests = await RideRequest.findAll({
                where: { driver_id: req.user.id, status: 'pending' }
            });

            const rideIds = rideRequests.map(r => r.ride_id);

            const rides = await Ride.findAll({
                where: {
                    id: rideIds.length ? rideIds : [-1],
                    status: { [Op.in]: ['assigned', 'pending'] }
                }
            });

            res.status(200).json(rides);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    // List assigned (active) rides for driver
    assignedRides: async (req, res) => {
        try {
            if (!isDriver(req.user)) return res.status(403).json({ error: 'Only drivers can see assigned rides.' });
            const { Op } = require('sequelize');
            const rides = await Ride.findAll({
                where: { driver_id: req.user.id, status: { [Op.in]: ['assigned', 'accepted'] } }
            });
            res.status(200).json(rides);
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
            res.status(200).json(ride);
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
                return res.status(409).json({ error: 'Cannot cancel this ride.' });
            }
            if (ride.driver_id) {
                await Driver.update({ is_available: true }, { where: { id: ride.driver_id } });
            }

            await RideRequest.update(
                { status: 'expired', responded_at: new Date() },
                { where: { ride_id: ride.id, status: 'pending' } }
            );

            if (ride.status === 'pending') {
                await paymentApi.put(`/by-ride/${ride.id}`, { status: 'canceled' });
            } else if (ride.status === 'assigned') {
                await paymentApi.put(`/by-ride/${ride.id}`, { status: 'canceled', driver_id: ride.driver_id });
            } else if (ride.status === 'accepted') {
                await paymentApi.put(`/by-ride/${ride.id}`, { status: 'paid', driver_id: ride.driver_id });
            }
            await PendingRideQueue.destroy({ where: { ride_id: ride.id } });
            await ride.update({ status: 'canceled', cancellation_reason: 'client_cancelled' });
            res.status(200).json({ message: 'Ride canceled.' });
        } catch (err) {
            console.error(err);
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
            if (!request) return res.status(409).json({ error: 'No pending request for this driver.' });

            await request.update({ status: 'accepted', responded_at: new Date() });

            // KLUCZOWE: przypnij kurs do akceptującego kierowcy i oznacz go jako zajętego
            await ride.update({
                status: 'accepted',
                driver_id: req.user.id,
                accepted_at: new Date()
            });

            await RideRequest.update(
                { status: 'expired', responded_at: new Date() },
                {
                    where: {
                        ride_id: ride.id,
                        status: 'pending',
                        driver_id: { [Op.ne]: req.user.id }
                    }
                }
            );

            await Driver.update(
                { is_available: false },
                { where: { id: req.user.id } }
            );

            await paymentApi.put(`/by-ride/${ride.id}`, {
                status: 'paid',
                driver_id: req.user.id
            });



            res.status(200).json({ message: 'Ride accepted.' });
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
            if (!ride) return res.status(404).json({ error: 'Ride not found' });

            const request = await RideRequest.findOne({
                where: { ride_id: ride.id, driver_id: req.user.id, status: 'pending' }
            });
            if (!request) return res.status(409).json({ error: 'No pending request for this driver.' });

            // Oznacz bieżące żądanie jako odrzucone
            await request.update({ status: 'rejected', responded_at: new Date() });

            // Zwolnij kierowcę
            await Driver.update(
                { is_available: true },
                { where: { id: req.user.id } }
            );

            // Wygaszenie innych pending RideRequest dla tego ride
            await RideRequest.update(
                { status: 'expired', responded_at: new Date() },
                { where: { ride_id: ride.id, status: 'pending' } }
            );

            // Dodaj ride do kolejki jeśli jeszcze nie istnieje
            await PendingRideQueue.findOrCreate({
                where: { ride_id: ride.id },
                defaults: { priority: 0 }
            });

            await ride.update({ status: 'pending', driver_id: null });

            // Natychmiast uruchom przetwarzanie kolejki
            queueService.processQueueNow();

            res.status(200).json({ message: 'Ride rejected. Queue system will try to assign another driver.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },



    completeRide: async (req, res) => {
        try {
            const { id } = req.params;
            if (!isDriver(req.user)) return res.status(403).json({ error: 'Only drivers can complete rides.' });

            const ride = await Ride.findByPk(id);
            if (!ride) return res.status(404).json({ error: 'Ride not found.' });

            // może zakończyć tylko kierowca przypięty do kursu i tylko kurs "accepted"
            if (ride.driver_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });
            if (ride.status !== 'accepted') return res.status(409).json({ error: 'Ride is not active.' });

            await ride.update({ status: 'completed', finished_at: new Date() });

            // Wygaszamy ewentualne pozostałe pending (gdyby jakieś się ostały)
            await RideRequest.update(
                { status: 'expired', responded_at: new Date() },
                { where: { ride_id: ride.id, status: 'pending' } }
            );

            // uwolnij kierowcę
            await Driver.update({ is_available: true }, { where: { id: req.user.id } });

            queueService.processQueueNow();

            res.status(200).json({ message: 'Ride completed.' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    cancelByDriverNoShow: async (req, res) => {
        try {
            const { id } = req.params;
            const ride = await Ride.findByPk(id);
            if (!ride) return res.status(404).json({ error: 'Ride not found' });
            if (ride.driver_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

            await ride.update({ status: 'canceled', cancellation_reason: 'client_no_show' });
            await Driver.update({ is_available: true }, { where: { id: req.user.id } });
            queueService.processQueueNow();

            await paymentApi.put(`/by-ride/${ride.id}`, {
                status: 'paid',
                driver_id: ride.driver_id
            });

            res.status(200).json({ message: 'Ride canceled due to client no-show. Payment paid.' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    cancelByDriverAfterAccept: async (req, res) => {
        try {
            const { id } = req.params;
            const ride = await Ride.findByPk(id);
            if (!ride) return res.status(404).json({ error: 'Ride not found' });
            if (ride.driver_id !== req.user.id) return res.status(403).json({ error: 'Forbidden.' });

            await ride.update({ status: 'canceled', cancellation_reason: 'driver_cancelled' });
            await Driver.update({ is_available: true }, { where: { id: req.user.id } });
            queueService.processQueueNow();

            await paymentApi.put(`/by-ride/${ride.id}`, { status: 'refunded' });

            res.status(200).json({ message: 'Ride canceled by driver, payment refunded.' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }


};
