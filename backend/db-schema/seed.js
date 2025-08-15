const { sequelize, User, Driver, Ride, RideRequest, Payment } = require('./models');

const dateShift = (minutes) => new Date(Date.now() + minutes * 60000);

async function seed() {
  try {
    await sequelize.sync({ force: true });

    // Admin
    await User.create({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      is_active: true,
      full_name: 'Konto admina',
      phone: '+48321123321',
    });

    // Clients
    const clients = [];
    for (let i = 1; i <= 3; i++) {
      clients.push(await User.create({
        username: `client${i}`,
        password: 'password123',
        role: 'client',
        is_active: true,
        full_name: `Klient Testowy ${i}`,
        phone: `+4811122233${i}`,
      }));
    }

    // Drivers + details
    const drivers = [];
    for (let i = 1; i <= 3; i++) {
      const user = await User.create({
        username: `driver${i}`,
        password: 'password123',
        role: 'driver',
        is_active: true,
        full_name: `Kierowca Testowy ${i}`,
        phone: `+4855566677${i}`,
      });
      await Driver.create({
        id: user.id,
        is_available: i % 2 === 1,
        car_make: ['Toyota', 'VW', 'Fiat'][i - 1],
        car_model: ['Corolla', 'Golf', 'Panda'][i - 1],
        car_plate: `KR00${i}ABC`,
      });
      drivers.push(user);
    }

    // Rides with coordinates + OSRM-like data
    const rideTemplates = [
      { from: "Kraków, Długa 23", to: "Kraków, Rynek 1", fromLat: 50.067, fromLon: 19.94, toLat: 50.061, toLon: 19.937, distance: 1500, duration: 300 },
      { from: "Kraków, Grodzka 12", to: "Kraków, Zakopiańska 14", fromLat: 50.061, fromLon: 19.936, toLat: 50.005, toLon: 19.945, distance: 6200, duration: 1200 },
      { from: "Kraków, Wielicka 100", to: "Kraków, Lubicz 1", fromLat: 50.017, fromLon: 19.97, toLat: 50.066, toLon: 19.949, distance: 5700, duration: 1000 },
      { from: "Kraków, Pilotów 5", to: "Kraków, Bora-Komorowskiego 39", fromLat: 50.082, fromLon: 19.973, toLat: 50.088, toLon: 19.995, distance: 2500, duration: 500 },
      { from: "Kraków, Dietla 99", to: "Kraków, Krowoderskich Zuchów 18", fromLat: 50.052, fromLon: 19.947, toLat: 50.086, toLon: 19.935, distance: 4200, duration: 800 }
    ];

    const rides = [];
    for (let i = 0; i < rideTemplates.length; i++) {
      const client = clients[i % clients.length];
      const driver = drivers[i % drivers.length];
      rides.push(await Ride.create({
        client_id: client.id,
        driver_id: driver.id,
        from_address: rideTemplates[i].from,
        to_address: rideTemplates[i].to,
        from_lat: rideTemplates[i].fromLat,
        from_lon: rideTemplates[i].fromLon,
        to_lat: rideTemplates[i].toLat,
        to_lon: rideTemplates[i].toLon,
        distance: rideTemplates[i].distance,
        duration: rideTemplates[i].duration,
        geometry: null, // Można później wypełnić z OSRM
        amount: Math.round((rideTemplates[i].distance / 1000) * 5 * 100) / 100,
        status: i % 2 === 0 ? 'completed' : 'pending',
        requested_at: dateShift(-120 + i * 15),
        accepted_at: i % 2 === 0 ? dateShift(-110 + i * 15) : null,
        finished_at: i % 2 === 0 ? dateShift(-100 + i * 15) : null,
      }));
    }

    // Ride requests for each "pending" ride
    for (let ride of rides) {
      if (ride.status === 'pending') {
        for (let d of drivers) {
          await RideRequest.create({
            ride_id: ride.id,
            driver_id: d.id,
            status: d.id === ride.driver_id ? 'accepted' : 'pending',
            requested_at: ride.requested_at,
            responded_at: d.id === ride.driver_id ? ride.accepted_at : null,
          });
        }
      }
    }

    // Payments for "completed" rides
    for (let ride of rides) {
      if (ride.status === 'completed') {
        await Payment.create({
          ride_id: ride.id,
          client_id: ride.client_id,
          amount: ride.amount,
          status: 'paid',
          method: ['card', 'blik', 'cash'][ride.id % 3],
          created_at: ride.finished_at,
          paid_at: ride.finished_at,
          reference: `PAY-${ride.id}${ride.client_id}${ride.driver_id}`,
        });
      }
    }

    console.log('Seed completed! Example data inserted.');
  } catch (e) {
    console.error('Seed failed:', e);
  }
}

seed();
