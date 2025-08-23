const { PendingRideQueue, Ride, Driver, RideRequest } = require('../../db-schema/models');
const { findAvailableDriver } = require('../helpers/driver');

class QueueService {
    constructor() {
        this.isProcessing = false;
        this.interval = null;
    }

    start() {
        // INTERWAŁ: sprawdzaj kolejkę co 30 sekund (30_000 ms)
        this.interval = setInterval(() => this.processQueue(), 10_000);
        console.log('Queue service started (interval = 30s)');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log('Queue service stopped');
    }

    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const pendingRides = await PendingRideQueue.findAll({
                include: [{ model: Ride, where: { status: 'pending' } }],
                order: [
                    ['priority', 'DESC'],
                    ['created_at', 'ASC']
                ],
                limit: 10
            });

            const now = new Date();

            for (const queueItem of pendingRides) {
                try {
                    const ride = queueItem.Ride;
                    const driver = await findAvailableDriver(ride.id);

                    if (driver) {
                        // Kierowca znaleziony → utwórz RideRequest
                        await RideRequest.create({
                            ride_id: ride.id,
                            driver_id: driver.id,
                            status: 'pending',
                            requested_at: new Date()
                        });

                        await ride.update({ status: 'assigned', driver_id: driver.id });
                        await Driver.update({ is_available: false }, { where: { id: driver.id } });

                        // Usuń z kolejki
                        await PendingRideQueue.destroy({ where: { id: queueItem.id } });

                        console.log(`Assigned ride ${ride.id} to driver ${driver.id} from queue`);
                    } else {
                        // Oblicz wiek wpisu w kolejce
                        const age = now - new Date(queueItem.created_at);

                        // LIMIT CZASU: jeśli ride czeka > 5 minut (300_000 ms) bez kierowcy → anuluj
                        if (age > 30 * 1000) {
                            await ride.update({ status: 'canceled', cancellation_reason: 'no_driver' });
                            await PendingRideQueue.destroy({ where: { id: queueItem.id } });
                            console.log(`Canceled ride ${ride.id} due to no available drivers after timeout`);
                        }
                    }

                } catch (err) {
                    console.error(`Error processing queue item ${queueItem.id}:`, err);
                }
            }
        } catch (err) {
            console.error('Error processing queue:', err);
        } finally {
            this.isProcessing = false;
        }
    }

    // Metoda do ręcznego wywołania przetwarzania kolejki
    async processQueueNow() {
        await this.processQueue();
    }
}

module.exports = new QueueService();
