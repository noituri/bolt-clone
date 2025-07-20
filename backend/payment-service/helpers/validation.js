function validatePaymentData({ ride_id, client_id, amount, status, method }) {
    if (!ride_id || isNaN(Number(ride_id))) return 'Invalid ride_id';
    if (!client_id || isNaN(Number(client_id))) return 'Invalid client_id';
    if (isNaN(Number(amount)) || Number(amount) <= 0) return 'Amount must be a positive number';
    if (!method || typeof method !== 'string' || method.length < 3) return 'Invalid payment method';
    return null;
}

module.exports = { validatePaymentData };
