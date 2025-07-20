function validateRideData({ from_address, to_address, amount }) {
    if (!from_address || typeof from_address !== 'string' || from_address.length < 3) return 'Invalid from_address';
    if (!to_address || typeof to_address !== 'string' || to_address.length < 3) return 'Invalid to_address';
    if (isNaN(amount) || amount <= 0) return 'Amount must be a positive number';
    return null;
}

module.exports = { validateRideData };