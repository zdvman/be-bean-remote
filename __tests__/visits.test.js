const firebaseAdmin = require('firebase-admin');
const endpointsJson = require('../endpoints.json');
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

describe('GET /api/visits?user_id=1', () => {
  test('200: Responds with all visits of a certain user', () => {
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
      .then(({ body }) => {
        expect(body.visits).toBeInstanceOf(Array);
        expect(body.visits.length).toBeGreaterThan(0);
        body.visits.forEach((visit) => {
          expect(visit).toMatchObject({
            user_id: expect.any(Number),
            cafe_id: expect.any(Number),
            visited_at: expect.any(String),
          });
        });
      });
  });
  test('404: returns an error 404 when the user has no visits', () => {
    return request(app)
      .get('/api/visits?user_id=2')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('This user has no visits');
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
        expect(response.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "abc"'
        );
      });
  });
});

describe('POST: api/visits', () => {
  test('return the new visit', () => {
    return request(app)
      .post('/api/visits')
      .send({
        user_id: 2,
        cafe_id: 1,
      })
      .expect(201)
      .then((res) => {
        expect(res.body.visit).toMatchObject({
          user_id: 2,
          cafe_id: 1,
          visited_at: expect.any(String),
        });
      });
  });
  test('400: responds with an error if user_id is missing', () => {
    return request(app)
      .post('/api/visits')
      .send({ cafe_id: 1 }) // Missing user_id
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Bad request : null value in column "user_id" of relation "cafe_visits" violates not-null constraint'
        );
      });
  });

  test('400: responds with an error if cafe_id is missing', () => {
    return request(app)
      .post('/api/visits')
      .send({ user_id: 2 }) // Missing cafe_id
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Bad request : null value in column "cafe_id" of relation "cafe_visits" violates not-null constraint'
        );
      });
  });
  test('404: responds with an error if user_id does not exist', () => {
    return request(app)
      .post('/api/visits')
      .send({ user_id: 9999, cafe_id: 1 }) // Non-existent user
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Not found : insert or update on table "cafe_visits" violates foreign key constraint "cafe_visits_user_id_fkey"'
        );
      });
  });

  test('404: responds with an error if cafe_id does not exist', () => {
    return request(app)
      .post('/api/visits')
      .send({ user_id: 2, cafe_id: 9999 }) // Non-existent cafe
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Not found : insert or update on table "cafe_visits" violates foreign key constraint "cafe_visits_cafe_id_fkey"'
        );
      });
  });
  test('400: responds with an error if user_id is not an integer', () => {
    return request(app)
      .post('/api/visits')
      .send({ user_id: 'abc', cafe_id: 1 }) // Invalid user_id
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "abc"'
        );
      });
  });

  test('400: responds with an error if cafe_id is not an integer', () => {
    return request(app)
      .post('/api/visits')
      .send({ user_id: 2, cafe_id: 'xyz' }) // Invalid cafe_id
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "xyz"'
        );
      });
  });
});
