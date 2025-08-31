const Driver = require('../../db-schema/models/Drivers');

const driverController = {
    getAllDrivers: async (req, res) => {
        try {
            const drivers = await Driver.findAll();
            res.status(200).json(drivers);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    getDriverById: async (req, res) => {
        try {
            const { id } = req.params;
            const driver = await Driver.findByPk(id);

            if (!driver) {
                return res.status(404).json({ error: 'Driver not found' });
            }

            res.status(200).json(driver);
        } catch (error) {
            console.error('Error fetching driver:', error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    createDriver: async (req, res) => {
        try {
            const { id, is_available, car_make, car_model, car_plate } = req.body;

            const driver = await Driver.create({
                id,
                is_available,
                car_make,
                car_model,
                car_plate
            });

            res.status(201).json(driver);
        } catch (error) {
            console.error('Error creating driver:', error);
            res.status(500).json({ error: 'Server error' });
        }
    },

    updateDriver: async (req, res) => {
        try {
            const { id } = req.params;
            const { is_available, car_make, car_model, car_plate } = req.body;

            const driver = await Driver.findByPk(id);
            if (!driver) {
                return res.status(404).json({ error: 'Driver not found' });
            }

            await driver.update({
                is_available,
                car_make,
                car_model,
                car_plate
            });

            res.status(200).json(driver);
        } catch (error) {
            console.error('Error updating driver:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
};

module.exports = driverController;