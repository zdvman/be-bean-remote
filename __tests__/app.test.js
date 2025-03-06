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

beforeEach(async () => {
  await db.query(`
    TRUNCATE TABLE 
      admins, reports, cafe_qr_codes, cafe_visits, user_favorites, 
      review_votes, review_responses, reviews, user_preferences, 
      cafe_amenities, amenities, cafe_media, cafes, users 
    RESTART IDENTITY CASCADE;
  `);
  await seed(testData);
});

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

describe('GET /cafes/:cafe_id', () => {
  test('200: Responds with a single cafe', () => {
    return request(app)
      .get('/api/cafes/1')
      .expect(200)
      .then((response) => {
        const cafe = response.body.cafe;
        expect(cafe.owner_id).toBe(2);
        expect(cafe.name).toBe('Remote Bean Central');
        expect(cafe.description).toBe('A cozy cafe for remote workers');
        expect(cafe.address).toBe('123 Coffee St, Manchester');
        expect(cafe.busy_status).toBe('quiet');
        expect(cafe.is_verified).toBe(false);
      });
  });
  test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
    return request(app)
      .get('/api/visits?user_id=4')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('User with ID "4" is not found');
      });
  });
  test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
    return request(app)
      .get('/api/visits?user_id=abc')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      });
  });
});

describe('GET /cafes', () => {
  test('200: Responds with an object containing all cafes', () => {
    return request(app)
      .get('/api/cafes')
      .expect(200)
      .then((response) => {
        const cafesArr = response.body.cafes;
        expect(Array.isArray(cafesArr)).toBe(true);
        expect(cafesArr[0].owner_id).toBe(2);
        expect(cafesArr[0].name).toBe('Remote Bean Central');
        expect(cafesArr[0].description).toBe('A cozy cafe for remote workers');
        expect(cafesArr[0].address).toBe('123 Coffee St, Manchester');
        // expect(cafesArr[0].location).toEqual({
        //   type: 'Point',
        //   coordinates: [-2.2426, 53.4808],
        // });
        expect(cafesArr[0].busy_status).toBe('quiet');
        expect(cafesArr[0].is_verified).toBe(false);
      });
  });
});
