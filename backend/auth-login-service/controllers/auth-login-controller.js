const jwt = require('jsonwebtoken');
const { User } = require('../../db-schema/models');

module.exports = {
    login: async (req, res) => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }
        try {
            const user = await User.findOne({ where: { username } });
            if (!user || !user.is_active || !(await user.comparePassword(password))) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            res.status(200).json({ token });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    register: async (req, res) => {
        const { username, password, role } = req.body;
        if (!username || !password || !['client', 'driver'].includes(role)) {
            return res.status(400).json({ error: 'Invalid input' });
        }
        try {
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            await User.create({ username, password, role });
            res.status(201).json({ message: 'User registered' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },

    changePassword: async (req, res) => {
        const { old_password, new_password } = req.body;
        if (!old_password || !new_password) {
            return res.status(400).json({ error: 'Old and new passwords required' });
        }
        try {
            const user = await User.findByPk(req.user.id);
            if (!user || !(await user.comparePassword(old_password))) {
                return res.status(400).json({ error: 'Wrong password' });
            }
            user.password = new_password;
            await user.save();
            res.status(200).json({ message: 'Password changed' });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    },
};