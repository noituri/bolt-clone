const { User } = require('../../db-schema/models');
const { Driver } = require('../../db-schema/models')

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: { exclude: ['password'] },
                order: [['created_at', 'DESC']]
            });
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    getUserById: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await User.findByPk(id, {
                attributes: { exclude: ['password'] }
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    addUser: async (req, res) => {
        const { username, password, role, full_name, phone } = req.body;

        if (!username || !password || !['client', 'driver', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid input' });
        }

        try {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            await User.create({ username, password, role, full_name, phone });
            res.status(201).json({ message: 'User created successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    modifyUser: async (req, res) => {
        const { id } = req.params;
        const { is_active, full_name, phone, role } = req.body;

        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (is_active !== undefined) user.is_active = is_active;
            if (full_name !== undefined) user.full_name = full_name;
            if (phone !== undefined) user.phone = phone;
            if (role !== undefined && ['client', 'driver', 'admin'].includes(role)) {
                user.role = role;
            }

            await user.save();
            res.status(200).json({ message: 'User updated successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    deleteUser: async (req, res) => {
        const { id } = req.params;

        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            await user.destroy();
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    changeUserPassword: async (req, res) => {
        const { id } = req.params;
        const { new_password } = req.body;

        if (!new_password) {
            return res.status(400).json({ error: "New password required" });
        }

        try {
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            user.password = new_password;
            await user.save();

            res.status(200).json({ message: "Password updated successfully" });
        } catch (err) {
            res.status(500).json({ error: "Server error" });
        }
    },

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