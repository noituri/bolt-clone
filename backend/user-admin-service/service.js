const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

app.use('/users', userRoutes);
app.use('/admin', adminRoutes);

app.listen(port, () => {
    console.log(`User-Admin service running on port ${port}`);
});
