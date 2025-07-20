const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const paymentsRoutes = require('./routes/payments');
app.use('/payments', paymentsRoutes);

app.get('/ping', (req, res) => {
    res.json({ msg: 'payment-service up and running' });
});

app.listen(port, () => {
    console.log(`Payment-service listening on port ${port}`);
});
