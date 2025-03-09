// cafes.js
module.exports = [
  {
    owner_id: 2, // Bob
    name: 'Remote Bean Central',
    description: 'A cozy cafe for remote workers',
    address: '123 Coffee St, Manchester',
    location: {
      type: 'Point',
      coordinates: [-2.2426, 53.4808],
    },
    busy_status: 'quiet',
    is_verified: false,
  },
  {
    owner_id: 2, // Bob
    name: 'Mocha Lounge',
    description: 'Perfect Wi-Fi and relaxed vibe',
    address: '24 Latte Lane, Manchester',
    location: {
      type: 'Point',
      coordinates: [-2.25, 53.4837],
    },
    busy_status: 'moderate',
    is_verified: false,
  },
  {
    owner_id: 2, // Bob
    name: 'Focus & Froth',
    description: 'Enjoy coworking space with great cappuccinos',
    address: '78 Espresso Road, Manchester',
    location: {
      type: 'Point',
      coordinates: [-2.237, 53.47],
    },
    busy_status: 'busy',
    is_verified: false,
  },
  {
    owner_id: 5, // Eve
    name: 'Cafe Serenity',
    description: 'A peaceful retreat for coffee lovers',
    address: '42 Tranquil Terrace, Plymouth',
    location: {
      type: 'Point',
      coordinates: [-4.1427, 50.3755],
    },
    busy_status: 'quiet',
    is_verified: true,
  },
];
