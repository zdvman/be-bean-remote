// __tests__/app.test.js
// Mock the firebase-admin module
jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

const firebaseAdmin = require('firebase-admin');
const endpointsJson = require('../endpoints.json');
const request = require('supertest');
const app = require('../src/app.js');
const db = require('../src/db/connection.js');
const testData = require('../src/db/data/test-data/index.js');
const seed = require('../src/db/seeds/seed.js');
require('jest-sorted');

afterAll(async () => {
  await db.end();
});

describe('GET /api', () => {
  test('200: Responds with an object detailing the documentation for each endpoint', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe('GET /users', () => {
  beforeAll(async () => {
    await seed(testData);
  });

  test('200: returns array of users if the user is admin', async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(Array.isArray(response.body.users)).toBe(true);
  });

  test('403: forbidden if the user is not admin', async () => {
    // Mock Firebase behavior for a non-admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('401: no token provided', async () => {
    const response = await request(app).get('/api/users').expect(401);
    expect(response.body.msg).toBe('No token provided');
  });

  test('201: Post a new user and return new user', async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID791',
      email: 'newuser2@example.com',
      full_name: 'Dmytro User',
    });

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', 'Bearer fakeToken')
      .expect(201);

    expect(response.body.user).toEqual({
      id: expect.any(Number),
      firebase_uid: 'userUID791',
      email: 'newuser2@example.com',
      full_name: 'Dmytro User',
      avatar: 'https://avatars.githubusercontent.com/u/17879520?v=4',
      role: 'user',
      location: null,
      points: 0,
      badges: [],
      notification_preferences: {},
      fcm_token: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  test('201: Post one more new user and return new user', async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID790',
      email: 'newuser@example.com',
      full_name: 'Luca User',
    });

    const response = await request(app)
      .post('/api/users')
      .set('Authorization', 'Bearer fakeToken')
      .expect(201);

    expect(response.body.user).toEqual({
      id: expect.any(Number),
      firebase_uid: 'userUID790',
      email: 'newuser@example.com',
      full_name: 'Luca User',
      avatar: 'https://avatars.githubusercontent.com/u/17879520?v=4',
      role: 'user',
      location: null,
      points: 0,
      badges: [],
      notification_preferences: {},
      fcm_token: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});

describe('GET /users/:id', () => {
  beforeAll(async () => {
    await seed(testData);
  });

  test('200: returns a user by user_id if request from admin', async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/users/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.user).toEqual({
      id: 1,
      firebase_uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
      avatar: 'https://example.com/alice.png',
      role: 'user',
      location: '0101000020E6100000FE43FAEDEBC0F8BF8351499D80E64A40',
      points: 50,
      badges: ['Helpful Reviewer'],
      notification_preferences: { email: true, push: false },
      fcm_token: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  test('403: if request from the user which is not the owner of the profile it is forbidden', async () => {
    // Mock Firebase behavior for an business user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'caroladbobbiz@example.com',
      full_name: 'Bob Business',
    });

    const response = await request(app)
      .get('/api/users/1') // Requesting user with ID 1 and it is not the owner of the profile
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('401: if request from the user which is not authorised', async () => {
    const response = await request(app)
      .get('/api/users/1') // No token in request
      .expect(401);

    expect(response.body.msg).toBe('No token provided');
  });

  test('200: returns a user by user_id if request from the user himself', async () => {
    // Mock Firebase behavior for an user - the owner of the profile
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .get('/api/users/1') // Requesting user with ID 1 and it is the owner of the profile
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.user).toEqual({
      id: 1,
      firebase_uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
      avatar: 'https://example.com/alice.png',
      role: 'user',
      location: '0101000020E6100000FE43FAEDEBC0F8BF8351499D80E64A40',
      points: 50,
      badges: ['Helpful Reviewer'],
      notification_preferences: { email: true, push: false },
      fcm_token: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});
