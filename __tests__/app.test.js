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

  afterAll(async () => {
    await db.end();
  });

  test('200: returns array of users if the user is admin', async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    await db.query(
      `UPDATE users SET role='admin' WHERE firebase_uid='adminUID789'`
    );

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

    await db.query(
      `UPDATE users SET role='user' WHERE firebase_uid='userUID123'`
    );

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
});
