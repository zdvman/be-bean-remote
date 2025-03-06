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

describe('GET /api/reports', () => {
  test('200: returns an array of reports (admin only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Admin user
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/reports')
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(Array.isArray(response.body.reports)).toBe(true);
    expect(response.body.reports).toHaveLength(2);
    response.body.reports.forEach((report) => {
      expect(report).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          reporter_id: expect.any(Number),
          cafe_id: expect.any(Number),
          reason: expect.any(String),
          status: expect.any(String),
        })
      );
    });
  });

  test('403: returns forbidden if user is not admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .get('/api/reports')
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });
});

describe('POST /api/reports', () => {
  test('201: creates and returns a new report (authenticated users only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123', // Regular user
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const newReport = {
      reporter_id: 1, // Alice
      cafe_id: 2,
      reason: 'Loud music complaint',
    };

    const response = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer fakeToken')
      .send(newReport)
      .expect(201);

    expect(response.body.report).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        reporter_id: 1,
        cafe_id: 2,
        reason: 'Loud music complaint',
        status: 'pending',
      })
    );

    const reports = await db.query('SELECT * FROM reports');
    expect(reports.rows).toHaveLength(3);
  });

  test('400: returns error if required fields are missing', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer fakeToken')
      .send({})
      .expect(400);

    expect(response.body.msg).toBe('Report is missing required fields');
  });
});

describe('GET /api/reports/:id', () => {
  test('200: returns a specific report by id (user or admin only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/reports/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.report).toEqual(
      expect.objectContaining({
        id: 1,
        reporter_id: expect.any(Number),
        cafe_id: expect.any(Number),
        reason: expect.any(String),
        status: expect.any(String),
      })
    );
  });

  test('404: returns error when report does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/reports/999')
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('No report found for report_id: 999');
  });
});

describe('PATCH /api/reports/:id', () => {
  test('200: updates a report and returns the updated report (admin only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .patch('/api/reports/1')
      .set('Authorization', 'Bearer fakeToken')
      .send({ status: 'resolved' })
      .expect(200);

    expect(response.body.report).toEqual(
      expect.objectContaining({
        id: 1,
        status: 'resolved',
      })
    );
  });

  test('403: returns forbidden if user is not admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .patch('/api/reports/1')
      .set('Authorization', 'Bearer fakeToken')
      .send({ status: 'resolved' })
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('404: returns error when report does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .patch('/api/reports/999')
      .set('Authorization', 'Bearer fakeToken')
      .send({ status: 'resolved' })
      .expect(404);

    expect(response.body.msg).toBe('No report found for report_id: 999');
  });
});

describe('DELETE /api/reports/:id', () => {
  test('204: deletes a report by ID (admin only)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    await request(app)
      .delete('/api/reports/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(204);

    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/reports/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('No report found for report_id: 1');
  });

  test('403: returns forbidden if user is not admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .delete('/api/reports/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('404: returns error when report does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .delete('/api/reports/999')
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('No report found for report_id: 999');
  });
});
