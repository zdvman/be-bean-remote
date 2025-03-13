// users.js
module.exports = [
  {
    firebase_uid: '0aC1ZV5faTQ7WCajzbKzbDjSXKu2',
    email: 'alice@example.com',
    full_name: 'Alice Example',
    avatar: 'https://example.com/alice.png',
    role: 'user',
    location: {
      type: 'Point',
      coordinates: [-1.5471, 53.8008], // Leeds
    },
    points: 50,
    badges: ['Helpful Reviewer'],
    notification_preferences: { email: true, push: false },
    fcm_token: null,
  },
  {
    firebase_uid: 'SukWuqu9AwTjdCBogqp4qR5rM3o2',
    email: 'bobbiz@example.com',
    full_name: 'Bob Business',
    avatar: 'https://example.com/bob.png',
    role: 'business',
    location: {
      type: 'Point',
      coordinates: [-2.2426, 53.4808], // Manchester
    },
    points: 10,
    badges: [],
    notification_preferences: { email: false, push: true },
    fcm_token: null,
  },
  {
    firebase_uid: 'nNlwVn19geXskitAtW0E2MtObZG2',
    email: 'caroladmin@example.com',
    full_name: 'Carol Admin',
    avatar: 'https://example.com/carol.png',
    role: 'admin',
    location: {
      type: 'Point',
      coordinates: [-0.1276, 51.5074], // London
    },
    points: 999,
    badges: ['Super Admin'],
    notification_preferences: {},
    fcm_token: null,
  },
  {
    firebase_uid: 'RA7AmRSO2TTHPk5ueT9wEIjHMcr2',
    email: 'dave@example.com',
    full_name: 'Dave Developer',
    avatar: 'https://example.com/dave.png',
    role: 'user',
    location: {
      type: 'Point',
      coordinates: [-1.8904, 52.4862], // Birmingham
    },
    points: 20,
    badges: ['Newbie'],
    notification_preferences: { email: true, push: true },
    fcm_token: 'token123',
  },
  {
    firebase_uid: '2XJfq7MX2KbBxwcjU3gnejc4mGn1',
    email: 'evebiz@example.com',
    full_name: 'Eve Entrepreneur',
    avatar: 'https://example.com/eve.png',
    role: 'business',
    location: {
      type: 'Point',
      coordinates: [-4.1427, 50.3755], // Plymouth
    },
    points: 30,
    badges: ['Cafe Owner'],
    notification_preferences: { email: true, push: false },
    fcm_token: null,
  },
  {
    firebase_uid: '3nSP4kGpC4RT7PksYic0W9tKatz1',
    email: 'frankadmin@example.com',
    full_name: 'Frank Admin',
    avatar: 'https://example.com/frank.png',
    role: 'admin',
    location: {
      type: 'Point',
      coordinates: [-3.1883, 55.9533], // Edinburgh
    },
    points: 1000,
    badges: ['Super Admin'],
    notification_preferences: {},
    fcm_token: null,
  },
];
