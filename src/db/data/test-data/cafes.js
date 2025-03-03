// cafes.js
module.exports = [
  {
    // We'll link this to Bob's user_id (which we'll discover is 2 after insert)
    owner_id: 2, // Mapped in the seed after we insert the users
    name: 'Remote Bean Central',
    description: 'A cozy cafe for remote workers',
    address: '123 Coffee St, Manchester',
    location: {
      type: 'Point',
      coordinates: [-2.2426, 53.4808],
    },
    busy_status: 'quiet', // or 'moderate'/'busy'
    is_verified: false,
  },
  {
    owner_id: 2,
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
    owner_id: 2,
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
];
