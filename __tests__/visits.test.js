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

describe("GET /api/visits?user_id=1",() => {
    beforeAll(async () => {
        await seed(testData);
      });
    test("200: Responds with all visits of a certain user", () => {
      // const result = { visits: [{
      //   user_id: 1,
      //   cafe_id: 1,
      //   visited_at: '2023-03-02T10:00:00Z',
      // },
      // {
      //   user_id: 1,
      //   cafe_id: 2,
      //   visited_at: '2023-03-03T11:15:00Z',
      // }]}
      return request(app)
      .get('/api/visits?user_id=1')
      .expect(200)
      .then(({body}) => {
        expect(body.visits).toBeInstanceOf(Array);
        expect(body.visits.length).toBeGreaterThan(0);
        body.visits.forEach((visit) => {
          expect(visit).toMatchObject({
            user_id: expect.any(Number),
            cafe_id: expect.any(Number),
            visited_at: expect.any(String),
          });
        });
      })
    });
    test("404: returns an error 404 when the user has no visits", () => {
      return request(app)
      .get('/api/visits?user_id=2')
      .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe('This user has no visits');
        });
    })
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