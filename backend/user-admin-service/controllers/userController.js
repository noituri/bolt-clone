const { User } = require('../../db-schema/models');

module.exports = {
    getProfile: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id, {
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

    updateProfile: async (req, res) => {
        const { full_name, phone } = req.body;
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (full_name !== undefined) user.full_name = full_name;
            if (phone !== undefined) user.phone = phone;

            await user.save();
            res.status(200).json({ message: 'Profile updated successfully' });
        } catch (err) {
            res.status(400).json({ error: 'Invalid data' });
        }
    }
};