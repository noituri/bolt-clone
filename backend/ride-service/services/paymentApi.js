const axios = require('axios');
const jwt = require('jsonwebtoken');

const PAYMENT_URL = process.env.PAYMENT_URL || 'http://payment-service:3002/payments';

const paymentApi = axios.create({
    baseURL: PAYMENT_URL
});

paymentApi.interceptors.request.use((config) => {
    const token = jwt.sign(
        { role: 'service', service: 'ride-service' },
        process.env.JWT_SECRET,
        { expiresIn: '1m' }
    );

    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

module.exports = paymentApi;
