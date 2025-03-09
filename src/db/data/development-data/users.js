// users.js
module.exports = [
  {
    firebase_uid: 'userUID123',
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
    firebase_uid: 'businessUID456',
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
    firebase_uid: 'adminUID789',
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
    firebase_uid: 'userUID456',
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
    firebase_uid: 'businessUID789',
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
    firebase_uid: 'adminUID012',
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
