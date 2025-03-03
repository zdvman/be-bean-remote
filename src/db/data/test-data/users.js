// users.js
module.exports = [
  {
    firebase_uid: 'testUID123',
    email: 'alice@example.com',
    full_name: 'Alice Example',
    avatar: 'https://example.com/alice.png',
    role: 'user',
    location: {
      type: 'Point',
      coordinates: [-1.5471, 53.8008], // [longitude, latitude]
    },
    points: 50,
    badges: ['Helpful Reviewer'],
    notification_preferences: { email: true, push: false },
    fcm_token: null,
  },
  {
    firebase_uid: 'testUID456',
    email: 'bobbiz@example.com',
    full_name: 'Bob Business',
    avatar: 'https://example.com/bob.png',
    role: 'business',
    location: {
      type: 'Point',
      coordinates: [-2.2426, 53.4808],
    },
    points: 10,
    badges: [],
    notification_preferences: { email: false, push: true },
    fcm_token: null,
  },
  {
    firebase_uid: 'testUID789',
    email: 'caroladmin@example.com',
    full_name: 'Carol Admin',
    avatar: 'https://example.com/carol.png',
    role: 'admin',
    location: {
      type: 'Point',
      coordinates: [-0.1276, 51.5074],
    },
    points: 999,
    badges: ['Super Admin'],
    notification_preferences: {},
    fcm_token: null,
  },
];
