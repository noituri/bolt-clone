function canAccessRide(user, ride) {
    if (!user || !ride) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'driver' && ride.driver_id === user.id) return true;
    if (user.role === 'client' && ride.client_id === user.id) return true;
    return false;
}

function isDriver(user) {
    return user && user.role === 'driver';
}

function isClient(user) {
    return user && user.role === 'client';
}

module.exports = { canAccessRide, isDriver, isClient };
