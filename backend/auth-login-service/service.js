const express = require('express');
const cors = require('cors');
const { sequelize } = require('../db-schema/models');
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

const authRoutes = require('./routes/auth-login');
app.use('/', authRoutes);

(async () => {
    await initializeDatabase();
    if (process.env.SEED_DB === '1') {
        require('../db-schema/seed');
    }
    app.listen(port, () => {
        console.log(`Auth service running on port ${port}`);
    });
})();