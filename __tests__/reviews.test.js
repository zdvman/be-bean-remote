// __tests__/reviews.test.js
jest.mock('firebase-admin', () => ({
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
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
  // Reset mocks and set up verifyIdToken to return a promise
  jest.clearAllMocks();
  firebaseAdmin.auth().verifyIdToken = jest.fn().mockImplementation((token) => {
    if (token === 'regularToken') return Promise.resolve({ uid: 'userUID123' });
    if (token === 'adminToken') return Promise.resolve({ uid: 'adminUID789' });
    if (token === 'businessToken')
      return Promise.resolve({ uid: 'businessUID456' });
    return Promise.reject(new Error('Invalid token'));
  });
});

afterAll(async () => {
  await db.end();
});

// Existing tests for GET and POST /api/cafes/:cafe_id/reviews remain unchanged
describe('GET /api/cafes/:cafe_id/reviews', () => {
  test('200: Responds with an object containing all reviews of a specific cafe', () => {
    return request(app)
      .get('/api/cafes/1/reviews')
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        reviews.forEach((comment) => {
          expect(comment).toMatchObject({
            user_id: expect.any(Number),
            cafe_id: expect.any(Number),
            rating: expect.any(Number),
            review_text: expect.any(String),
            helpful_count: expect.any(Number),
          });
        });
      });
  });
  test('404: Sends an appropriate status and error message when given a valid but non-existent id', () => {
    return request(app)
      .get('/api/cafes/999/reviews')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('Cafe with ID "999" is not found');
      });
  });
  test('400: Sends an appropriate status and error message when given an invalid id', () => {
    return request(app)
      .get('/api/cafes/not-a-cafe/reviews')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "not-a-cafe"'
        );
      });
  });
  test('200: Sends an empty array when given a cafe with no reviews', () => {
    return request(app)
      .get('/api/cafes/3/reviews')
      .expect(200)
      .then((response) => {
        expect(response.body.reviews).toEqual([]);
      });
  });
});

describe('POST /api/cafes/:cafe_id/reviews', () => {
  test('201: Returns the new review', () => {
    return request(app)
      .post('/api/cafes/3/reviews')
      .send({
        rating: 5,
        review_text: 'Fantastic coffee, great atmosphere!',
      })
      .set('Authorization', 'Bearer regularToken')
      .expect(201)
      .then((res) => {
        expect(res.body.review).toMatchObject({
          user_id: 1,
          cafe_id: 3,
          rating: 5,
          review_text: 'Fantastic coffee, great atmosphere!',
          helpful_count: 0,
        });
      });
  });
  test('400: Responds with an error if rating is missing', () => {
    return request(app)
      .post('/api/cafes/1/reviews')
      .send({ review_text: 'Fantastic coffee, great atmosphere!' })
      .set('Authorization', 'Bearer regularToken')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe('Rating must be between 1 and 5');
      });
  });
  test('404: Responds with an error if user_id does not exist', () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID127', // Non-existent user
    });
    return request(app)
      .post('/api/cafes/3/reviews')
      .send({
        rating: 5,
        review_text: 'Fantastic coffee, great atmosphere!',
      })
      .set('Authorization', 'Bearer fakeToken')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('User not found, please register first');
      });
  });
  test('404: Responds with an error if cafe_id does not exist', () => {
    return request(app)
      .post('/api/cafes/4/reviews')
      .send({
        rating: 5,
        review_text: 'Fantastic coffee, great atmosphere!',
      })
      .set('Authorization', 'Bearer regularToken')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('Cafe with ID "4" is not found');
      });
  });
  test('400: Responds with an error if cafe_id is not an integer', () => {
    return request(app)
      .post('/api/cafes/abc/reviews')
      .send({
        rating: 5,
        review_text: 'Fantastic coffee, great atmosphere!',
      })
      .set('Authorization', 'Bearer regularToken')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "abc"'
        );
      });
  });
});

// New tests for review endpoints
describe('GET /api/reviews/:review_id', () => {
  test('200: Responds with an array containing the review object', () => {
    return request(app)
      .get('/api/reviews/1')
      .expect(200)
      .then((res) => {
        const reviews = res.body.reviews;
        expect(reviews).toHaveLength(1);
        expect(reviews[0]).toMatchObject({
          id: 1,
          user_id: 1,
          cafe_id: 1,
          rating: expect.any(Number),
          review_text: expect.any(String),
          helpful_count: 0,
        });
      });
  });
  test('404: Responds with error when review_id does not exist', () => {
    return request(app)
      .get('/api/reviews/999')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('No reviews found for id: 999');
      });
  });
  test('400: Responds with error when review_id is invalid', () => {
    return request(app)
      .get('/api/reviews/invalid')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "invalid"'
        );
      });
  });
});

describe('DELETE /api/reviews/:review_id', () => {
  // Note: allowToUserOrAdmin is incorrect here; it checks user_id, not review ownership.
  // Assuming intended behavior is review owner or admin can delete.
  test('204: Deletes the review when requested by the owner', () => {
    return request(app)
      .delete('/api/reviews/1')
      .set('Authorization', 'Bearer regularToken') // User 1 owns review 1
      .expect(204)
      .then(() => {
        return request(app).get('/api/reviews/1').expect(404);
      });
  });
  test('204: Deletes the review when requested by an admin', () => {
    return request(app)
      .delete('/api/reviews/1')
      .set('Authorization', 'Bearer adminToken') // User 3 is admin
      .expect(204)
      .then(() => {
        return request(app).get('/api/reviews/1').expect(404);
      });
  });
  test('403: Forbidden when requested by a non-owner, non-admin user', () => {
    return request(app)
      .delete('/api/reviews/1')
      .set('Authorization', 'Bearer businessToken') // User 2
      .expect(403)
      .then((res) => {
        expect(res.body.msg).toBe('Forbidden');
      });
  });
  test('401: Unauthorized when no token is provided', () => {
    return request(app)
      .delete('/api/reviews/1')
      .expect(401)
      .then((res) => {
        expect(res.body.msg).toBe('No token provided');
      });
  });
  test('404: Not found when review_id does not exist', () => {
    return request(app)
      .delete('/api/reviews/999')
      .set('Authorization', 'Bearer adminToken')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('Review with ID "999" not found');
      });
  });
  test('400: Bad request when review_id is invalid', () => {
    return request(app)
      .delete('/api/reviews/invalid')
      .set('Authorization', 'Bearer adminToken')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "NaN"'
        );
      });
  });
});

describe('GET /api/reviews/:review_id/votes', () => {
  test('200: Responds with the count of helpful votes', () => {
    return request(app)
      .get('/api/reviews/1/votes?type=helpful')
      .expect(200)
      .then((res) => {
        expect(res.body.count).toBe(0); // Initial helpful_count
      });
  });
  test('200: Responds with the count of unhelpful votes', () => {
    return request(app)
      .get('/api/reviews/1/votes?type=unhelpful')
      .expect(200)
      .then((res) => {
        expect(res.body.count).toBe('0'); // No votes initially, returns string from COUNT
      });
  });
  test('400: Responds with error if type is missing', () => {
    return request(app)
      .get('/api/reviews/1/votes')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe('Invalid vote type');
      });
  });
  test('400: Responds with error if type is invalid', () => {
    return request(app)
      .get('/api/reviews/1/votes?type=invalid')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe('Invalid vote type');
      });
  });
  // Note: Current code doesn't check review existence, may throw error or return undefined
  test('404: Handles error if review does not exist (current behavior)', () => {
    return request(app)
      .get('/api/reviews/999/votes?type=helpful')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('Review with ID "999" is not found');
      });
  });
});

describe('GET /api/reviews/:review_id/vote', () => {
  test("200: Responds with the user's current vote type", () => {
    return db
      .query(
        "INSERT INTO review_votes (user_id, review_id, vote_type) VALUES (1, 1, 'helpful')"
      )
      .then(() => {
        return request(app)
          .get('/api/reviews/1/vote')
          .set('Authorization', 'Bearer regularToken')
          .expect(200)
          .then((res) => {
            expect(res.body.vote_type).toBe('helpful');
          });
      });
  });
  test('200: Responds with null if user has not voted', () => {
    return request(app)
      .get('/api/reviews/1/vote')
      .set('Authorization', 'Bearer regularToken')
      .expect(200)
      .then((res) => {
        expect(res.body.vote_type).toBe(null);
      });
  });
  test('401: Unauthorized if no token provided', () => {
    return request(app)
      .get('/api/reviews/1/vote')
      .expect(401)
      .then((res) => {
        expect(res.body.msg).toBe('No token provided');
      });
  });
  // Note: Current code doesn't check review existence, returns null
  test('200: Returns null if review does not exist (current behavior)', () => {
    return request(app)
      .get('/api/reviews/999/vote')
      .set('Authorization', 'Bearer regularToken')
      .expect(200)
      .then((res) => {
        expect(res.body.vote_type).toBe(null);
      });
  });
});

describe('POST /api/reviews/:review_id/vote', () => {
  test('200: Inserts a new helpful vote and increments helpful_count', () => {
    return request(app)
      .post('/api/reviews/1/vote?type=helpful')
      .set('Authorization', 'Bearer regularToken')
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          helpful_count: 1,
          vote_type: 'helpful',
        });
        return db.query('SELECT helpful_count FROM reviews WHERE id = 1');
      })
      .then(({ rows }) => {
        expect(rows[0].helpful_count).toBe(1);
      });
  });
  test('200: Deletes the vote if already voted helpful and decrements helpful_count', () => {
    return db
      .query(
        "INSERT INTO review_votes (user_id, review_id, vote_type) VALUES (1, 1, 'helpful')"
      )
      .then(() => db.query('UPDATE reviews SET helpful_count = 1 WHERE id = 1'))
      .then(() => {
        return request(app)
          .post('/api/reviews/1/vote?type=helpful')
          .set('Authorization', 'Bearer regularToken')
          .expect(200)
          .then((res) => {
            expect(res.body.vote_type).toBe(null);
            return db.query('SELECT helpful_count FROM reviews WHERE id = 1');
          })
          .then(({ rows }) => {
            expect(rows[0].helpful_count).toBe(0);
          });
      });
  });
  test('200: Updates vote from unhelpful to helpful and increments helpful_count', () => {
    return db
      .query(
        "INSERT INTO review_votes (user_id, review_id, vote_type) VALUES (1, 1, 'unhelpful')"
      )
      .then(() => {
        return request(app)
          .post('/api/reviews/1/vote?type=helpful')
          .set('Authorization', 'Bearer regularToken')
          .expect(200)
          .then((res) => {
            expect(res.body.vote_type).toBe('helpful');
            return db.query('SELECT helpful_count FROM reviews WHERE id = 1');
          })
          .then(({ rows }) => {
            expect(rows[0].helpful_count).toBe(1);
          });
      });
  });
  test('200: Inserts a new unhelpful vote', () => {
    return request(app)
      .post('/api/reviews/1/vote?type=unhelpful')
      .set('Authorization', 'Bearer regularToken')
      .expect(200)
      .then((res) => {
        expect(res.body.vote_type).toBe('unhelpful');
        return db.query('SELECT helpful_count FROM reviews WHERE id = 1');
      })
      .then(({ rows }) => {
        expect(rows[0].helpful_count).toBe(0); // Unhelpful doesn’t affect helpful_count
      });
  });
  test('200: Deletes the vote if already voted unhelpful', () => {
    return db
      .query(
        "INSERT INTO review_votes (user_id, review_id, vote_type) VALUES (1, 1, 'unhelpful')"
      )
      .then(() => {
        return request(app)
          .post('/api/reviews/1/vote?type=unhelpful')
          .set('Authorization', 'Bearer regularToken')
          .expect(200)
          .then((res) => {
            expect(res.body.vote_type).toBe(null);
            return db.query('SELECT helpful_count FROM reviews WHERE id = 1');
          })
          .then(({ rows }) => {
            expect(rows[0].helpful_count).toBe(0);
          });
      });
  });
  test('200: Updates vote from helpful to unhelpful and decrements helpful_count', () => {
    return db
      .query(
        "INSERT INTO review_votes (user_id, review_id, vote_type) VALUES (1, 1, 'helpful')"
      )
      .then(() => db.query('UPDATE reviews SET helpful_count = 1 WHERE id = 1'))
      .then(() => {
        return request(app)
          .post('/api/reviews/1/vote?type=unhelpful')
          .set('Authorization', 'Bearer regularToken')
          .expect(200)
          .then((res) => {
            expect(res.body.vote_type).toBe('unhelpful');
            return db.query('SELECT helpful_count FROM reviews WHERE id = 1');
          })
          .then(({ rows }) => {
            expect(rows[0].helpful_count).toBe(0);
          });
      });
  });
  test('400: Bad request if type is invalid', () => {
    return request(app)
      .post('/api/reviews/1/vote?type=invalid')
      .set('Authorization', 'Bearer regularToken')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe('Invalid vote type');
      });
  });
  test('400: Bad request if type is missing', () => {
    return request(app)
      .post('/api/reviews/1/vote')
      .set('Authorization', 'Bearer regularToken')
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe('Invalid vote type');
      });
  });
  test('404: Not found if review does not exist', () => {
    return request(app)
      .post('/api/reviews/999/vote?type=helpful')
      .set('Authorization', 'Bearer regularToken')
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('Review with ID "999" is not found');
      });
  });
  test('401: Unauthorized if no token provided', () => {
    return request(app)
      .post('/api/reviews/1/vote?type=helpful')
      .expect(401)
      .then((res) => {
        expect(res.body.msg).toBe('No token provided');
      });
  });
});

