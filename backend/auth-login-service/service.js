const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('db-schema');
require('dotenv').config();

async function initializeDatabase() {
    console.log('Initializing database...');
    try {
        await sequelize.sync({ force: true });
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.get('/get', async (req , res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    try {
        const user = await User.findOne({ where: { username } });
        res.status(200).json({ password: user.password, username: user.username });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    try {
        const user = await User.findOne({ where: { username } });
        if (!user || !user.is_active || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/register', async (req, res) => {
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
});

app.put('/users/change-password', authMiddleware, async (req, res) => {
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
});

(async () => {
    await initializeDatabase();
    app.listen(port, () => {
        console.log(`Auth service running on port ${port}`);
    });
})();