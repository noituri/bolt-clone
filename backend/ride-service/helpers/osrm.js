const axios = require('axios');

async function getRouteInfo(start, end) {
    // start i end w formacie: { lat: number, lon: number }
    const url = `http://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`;
    const res = await axios.get(url);

    if (!res.data.routes || res.data.routes.length === 0) {
        throw new Error('No route found');
    }

    const route = res.data.routes[0];
    return {
        distance: route.distance, // metry
        duration: route.duration, // sekundy
        geometry: route.geometry  // do narysowania na mapie
    };
}

module.exports = { getRouteInfo };
