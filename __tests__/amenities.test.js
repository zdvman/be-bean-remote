// __tests__/amenities.test.js
// Mock the firebase-admin module
jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

const firebaseAdmin = require('firebase-admin');
const request = require('supertest');
const app = require('../src/app.js');
const db = require('../src/db/connection.js');
const testData = require('../src/db/data/test-data/index.js');
const seed = require('../src/db/seeds/seed.js');
require('jest-sorted');

beforeEach(async () => {
  await seed(testData);
});

afterAll(async () => {
  await db.end();
});

describe('GET /api/amenities', () => {
  test('200: returns an array of amenities', async () => {
    const response = await request(app).get('/api/amenities').expect(200);

    expect(Array.isArray(response.body.amenities)).toBe(true);
    expect(response.body.amenities).toHaveLength(3);
    response.body.amenities.forEach((amenity) => {
      expect(amenity).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        })
      );
    });
  });
});

describe('POST /api/amenities', () => {
  test('201: creates and returns a new amenity (admin only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Admin user
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const newAmenity = { name: 'Quiet Atmosphere' };

    const response = await request(app)
      .post('/api/amenities')
      .set('Authorization', 'Bearer fakeToken')
      .send(newAmenity)
      .expect(201);

    expect(response.body.amenity).toEqual({
      id: expect.any(Number),
      name: 'Quiet Atmosphere',
    });

    const amenities = await db.query('SELECT * FROM amenities');
    expect(amenities.rows).toHaveLength(4);
  });

  test('403: returns forbidden if user is not admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .post('/api/amenities')
      .set('Authorization', 'Bearer fakeToken')
      .send({ name: 'Live Music' })
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('400: returns error if amenity name is missing', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .post('/api/amenities')
      .set('Authorization', 'Bearer fakeToken')
      .send({})
      .expect(400);

    expect(response.body.msg).toBe('Amenity name is missing');
  });
});

describe('GET /api/amenities/:id', () => {
  test('200: returns the amenity by its ID', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Admin user
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/amenities/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.amenity).toEqual({
      id: 1,
      name: 'WiFi',
    });
  });

  test('404: returns error when amenity ID does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Admin user
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });
    const response = await request(app)
      .get('/api/amenities/999')
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('No amenity found for amenity_id: 999');
  });

  test('400: returns error when amenity ID is invalid', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Admin user
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/amenities/not-a-number')
      .set('Authorization', 'Bearer fakeToken')
      .expect(400);

    expect(response.body.msg).toBe('Bad request');
    expect(response.body.error).toBe(
      'invalid input syntax for type integer: "not-a-number"'
    );
  });
});

describe('PATCH /api/amenities/:id', () => {
  test('200: updates an amenity name and returns the updated amenity (admin only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .patch('/api/amenities/1')
      .set('Authorization', 'Bearer fakeToken')
      .send({ name: 'High-Speed WiFi' })
      .expect(200);

    expect(response.body.amenity).toEqual({
      id: 1,
      name: 'High-Speed WiFi',
    });
  });

  test('403: returns forbidden if user is not admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .patch('/api/amenities/1')
      .set('Authorization', 'Bearer fakeToken')
      .send({ name: 'Live Music' })
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('400: returns error when amenity name is missing', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .patch('/api/amenities/1')
      .set('Authorization', 'Bearer fakeToken')
      .send({})
      .expect(400);

    expect(response.body.msg).toBe('Amenity name is missing');
  });

  test('404: returns error when amenity ID does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .patch('/api/amenities/999')
      .set('Authorization', 'Bearer fakeToken')
      .send({ name: 'Premium Seating' })
      .expect(404);

    expect(response.body.msg).toBe('No amenity found for amenity_id: 999');
  });
});

describe('DELETE /api/amenities/:id', () => {
  test('204: deletes an amenity by ID (admin only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    await request(app)
      .delete('/api/amenities/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(204);

    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/amenities/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('No amenity found for amenity_id: 1');
  });

  test('403: returns forbidden if user is not admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .delete('/api/amenities/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('404: returns error when amenity ID does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .delete('/api/amenities/999')
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('No amenity found for amenity_id: 999');
  });
});
