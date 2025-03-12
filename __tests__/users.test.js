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

describe('GET /users', () => {
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

describe('GET /users/:user_id', () => {
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

describe('PATCH /users/:user_id', () => {
  test('200: updates full_name and returns updated user', async () => {
    // Mock Firebase behavior for the user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const updateData = { full_name: 'Alice Updated' };

    const response = await request(app)
      .patch('/api/users/1')
      .set('Authorization', 'Bearer fakeToken')
      .send(updateData)
      .expect(200);

    expect(response.body.user).toMatchObject({
      id: 1,
      full_name: 'Alice Updated',
    });
  });

  test('200: updates multiple fields including location and avatar', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const updateData = {
      full_name: 'Alice Changed',
      avatar: 'https://example.com/new-avatar.png',
      location: { longitude: -2.2426, latitude: 53.4808 },
    };

    const response = await request(app)
      .patch('/api/users/1')
      .set('Authorization', 'Bearer fakeToken')
      .send(updateData)
      .expect(200);

    expect(response.body.user).toMatchObject({
      id: 1,
      full_name: 'Alice Changed',
      avatar: 'https://example.com/new-avatar.png',
    });
  });

  test('403: forbidden if request is from a different user', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const updateData = { full_name: 'Not Allowed' };

    const response = await request(app)
      .patch('/api/users/1')
      .set('Authorization', 'Bearer fakeToken')
      .send(updateData)
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('401: unauthorized if no token provided', async () => {
    const updateData = { full_name: 'Should Fail' };

    const response = await request(app)
      .patch('/api/users/1')
      .send(updateData)
      .expect(401);

    expect(response.body.msg).toBe('No token provided');
  });

  test('400: fails if no valid fields are provided', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const updateData = {};

    const response = await request(app)
      .patch('/api/users/1')
      .set('Authorization', 'Bearer fakeToken')
      .send(updateData)
      .expect(400);

    expect(response.body.msg).toBe('No valid fields provided for update');
  });

  test('404: fails if user does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123', // Mocking a valid, authenticated user
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const updateData = {
      full_name: 'New Name',
    };

    const response = await request(app)
      .patch('/api/users/999') // User ID 999 does not exist
      .set('Authorization', 'Bearer fakeToken') // Fake token, but mocked auth should pass
      .send(updateData)
      .expect(404); // Expecting a "User Not Found" response

    expect(response.body.msg).toBe('User with ID "999" is not found');
  });
});

describe('PATCH /users/:user_id/amenities', () => {
  test('200: updates user amenities by the user (owner of the profile)', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const updateData = {
      amenities: [1, 3], // WiFi and Outdoor Seating
    };

    const response = await request(app)
      .patch('/api/users/1/amenities')
      .set('Authorization', 'Bearer fakeToken')
      .send(updateData)
      .expect(200);

    // Check if amenities are updated correctly
    const checkAmenities = await db.query(
      `SELECT amenity_id FROM user_preferences WHERE user_id = $1`,
      [1]
    );

    const receivedAmenities = checkAmenities.rows
      .map((row) => row.amenity_id)
      .sort();
    const expectedAmenities = [1, 3].sort();

    expect(receivedAmenities).toEqual(expectedAmenities);
  });

  test('400: fails when amenities list is empty', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const updateData = {
      amenities: [], // Empty list should return 400
    };

    const response = await request(app)
      .patch('/api/users/1/amenities')
      .set('Authorization', 'Bearer fakeToken')
      .send(updateData)
      .expect(400);

    expect(response.body.msg).toBe('Amenities list is empty or invalid');
  });

  test('403: fails when user tries to update someone else’s amenities', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456', // Not the owner
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const updateData = {
      amenities: [1, 3], // WiFi and Outdoor Seating
    };

    const response = await request(app)
      .patch('/api/users/1/amenities') // Targeting Alice (userID 1)
      .set('Authorization', 'Bearer fakeToken')
      .send(updateData)
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('401: fails when no token is provided', async () => {
    const updateData = {
      amenities: [1, 3], // WiFi and Outdoor Seating
    };

    const response = await request(app)
      .patch('/api/users/1/amenities') // No token
      .send(updateData)
      .expect(401);

    expect(response.body.msg).toBe('No token provided');
  });
});

describe('DELETE /users/:user_id', () => {
  beforeEach(async () => {
    await seed(testData);
  });

  test('200: deletes user successfully if request from admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const result = await request(app)
      .delete('/api/users/2') // Bob Business user
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(result.body.msg).toBe('User deleted successfully');

    // Check the user is removed from the database
    const checkUser = await db.query('SELECT * FROM users WHERE id = $1', [2]);
    expect(checkUser.rows.length).toBe(0);
  });

  test('403: cannot delete user if not admin', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123', // Alice (Regular User)
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .delete('/api/users/2') // Trying to delete another user
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('401: fails if no authorization token is provided', async () => {
    const response = await request(app).delete('/api/users/2').expect(401);

    expect(response.body.msg).toBe('No token provided');
  });

  test('404: fails if user does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Admin user
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .delete('/api/users/999') // Non-existent user ID
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('User with ID "999" is not found');
  });
});

describe('GET /users/:user_id/favourites', () => {
  test('200: returns list of favorite cafes for a given user', async () => {
    // Mock Firebase behavior for an authenticated user (Alice - userUID123)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .get('/api/users/1/favourites') // Alice's user_id is 1
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.favourites).toEqual([
      {
        cafe_id: 1,
        name: 'Remote Bean Central',
        description: 'A cozy cafe for remote workers',
        address: '123 Coffee St, Manchester',
        location: 'POINT(-2.2426 53.4808)',
        busy_status: 'quiet',
        is_verified: false,
        created_at: expect.any(String),
      },
    ]);
  });

  test('200: returns empty array if user has no favorite cafes', async () => {
    // Mock Firebase behavior for a user with no favorites (Bob - businessUID456)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const response = await request(app)
      .get('/api/users/2/favourites') // Bob's user_id is 2
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.favourites).toEqual([]); // Bob has no favorite cafes
  });

  test('401: fails when no authorization token is provided', async () => {
    const response = await request(app)
      .get('/api/users/1/favourites')
      .expect(401);

    expect(response.body.msg).toBe('No token provided');
  });

  test('403: fails when a user tries to access another user’s favorites', async () => {
    // Mock Firebase behavior for a different user (Bob - businessUID456)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const response = await request(app)
      .get('/api/users/1/favourites') // Bob is trying to access Alice's favorites
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('404: fails if user does not exist', async () => {
    // Mock Firebase behavior for an unknown user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'nonexistentUID',
      email: 'ghost@example.com',
      full_name: 'Ghost User',
    });

    const response = await request(app)
      .get('/api/users/999/favourites') // User 999 does not exist
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('User not found, please register first');
  });
});

describe('POST /users/:user_id/favourites', () => {
  test('201: adds a cafe to favorites and returns full cafe details', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const newFavorite = { cafe_id: 2 }; // Mocha Lounge

    const response = await request(app)
      .post('/api/users/1/favourites') // Alice (user_id = 1) adds a favorite cafe
      .set('Authorization', 'Bearer fakeToken')
      .send(newFavorite)
      .expect(201);

    expect(response.body.favourite).toEqual({
      cafe_id: 2,
      name: 'Mocha Lounge',
      description: 'Perfect Wi-Fi and relaxed vibe',
      address: '24 Latte Lane, Manchester',
      location: 'POINT(-2.25 53.4837)',
      busy_status: 'moderate',
      is_verified: false,
      created_at: expect.any(String),
    });

    // Verify that the record exists in the database
    const checkFavorite = await db.query(
      `SELECT * FROM user_favorites WHERE user_id = $1;`,
      [1]
    );

    expect(checkFavorite.rows.length).toBe(2);
  });

  test('400: fails if the cafe_id is missing in the request body', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .post('/api/users/1/favourites')
      .set('Authorization', 'Bearer fakeToken')
      .send({})
      .expect(400);

    expect(response.body.msg).toBe('Cafe ID is missing');
  });

  test('404: fails if the cafe does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .post('/api/users/1/favourites')
      .set('Authorization', 'Bearer fakeToken')
      .send({ cafe_id: 999 }) // Non-existing cafe
      .expect(404);

    expect(response.body.msg).toBe('Cafe with ID "999" is not found');
  });

  test('404: fails if the user does not exist', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'nonexistentUID',
      email: 'ghost@example.com',
      full_name: 'Ghost User',
    });

    const response = await request(app)
      .post('/api/users/999/favourites') // Non-existing user
      .set('Authorization', 'Bearer fakeToken')
      .send({ cafe_id: 2 })
      .expect(404);

    expect(response.body.msg).toBe('User not found, please register first');
  });

  test('409: fails if the cafe is already in user’s favorites', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    // Alice already favorited cafe_id = 1 (see seed data)
    const response = await request(app)
      .post('/api/users/1/favourites')
      .set('Authorization', 'Bearer fakeToken')
      .send({ cafe_id: 1 })
      .expect(409);

    expect(response.body.msg).toBe('Cafe with ID "1" is already in favourites');
  });

  test('400: fails if user_id is NaN', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .post('/api/users/NaN/favourites') // Provide an invalid user_id
      .set('Authorization', 'Bearer fakeToken')
      .send({ cafe_id: 2 })
      .expect(400); // Now it should correctly trigger "User ID is missing"

    expect(response.body.msg).toBe(
      'Bad request : invalid input syntax for type integer: "NaN"'
    );
  });
});

describe('GET /users/:user_id/reviews', () => {
  test('200: returns all reviews written by the user', async () => {
    // Mock Firebase authentication for Alice (user_id = 1)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .get('/api/users/1/reviews') // Alice's user_id = 1
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.reviews.sort()).toEqual(
      [
        {
          review_id: expect.any(Number),
          cafe_id: 2,
          cafe_name: 'Mocha Lounge',
          cafe_address: '24 Latte Lane, Manchester',
          rating: 4,
          review_text: 'Wi-Fi was decent, a bit crowded though',
          helpful_count: 2,
          created_at: expect.any(String),
          reviewer_name: 'Alice Example',
        },
        {
          review_id: expect.any(Number),
          cafe_id: 1,
          cafe_name: 'Remote Bean Central',
          cafe_address: '123 Coffee St, Manchester',
          rating: 5,
          review_text: 'Fantastic coffee, great atmosphere!',
          helpful_count: 0,
          created_at: expect.any(String),
          reviewer_name: 'Alice Example',
        },
      ].sort()
    );
  });

  test('200: returns empty array if user has no reviews', async () => {
    // Mock Firebase authentication for Bob (user_id = 2)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const response = await request(app)
      .get('/api/users/2/reviews') // Bob's user_id = 2
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.reviews).toEqual([]); // Bob has no reviews
  });

  test('401: fails when no authorization token is provided', async () => {
    const response = await request(app)
      .get('/api/users/1/reviews') // No token provided
      .expect(401);

    expect(response.body.msg).toBe('No token provided');
  });

  test('403: fails when a user tries to access another user’s reviews', async () => {
    // Mock Firebase authentication for Bob (user_id = 2)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const response = await request(app)
      .get('/api/users/1/reviews') // Bob tries to access Alice's reviews
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('404: fails if user does not exist', async () => {
    // Mock Firebase authentication for a non-existent user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'nonexistentUID',
      email: 'ghost@example.com',
      full_name: 'Ghost User',
    });

    const response = await request(app)
      .get('/api/users/999/reviews') // Non-existent user ID 999
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('User not found, please register first');
  });
});

describe('DELETE /api/users/:user_id/reviews/:review_id', () => {
  test('204: deletes a review if the user owns it', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123', // Alice
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    await request(app)
      .delete('/api/users/1/reviews/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(204);

    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Admin user
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    // Verify review no longer exists
    const response = await request(app)
      .get('/api/users/1/reviews/1')
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('Review with ID "1" is not found');
  });

  test('403: returns forbidden if user tries to delete another user’s review', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123', // Alice
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .delete('/api/users/3/reviews/3') // Alice tries to delete Carol’s review
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('204: admin can delete any user’s review', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Carol Admin
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    await request(app)
      .delete('/api/users/1/reviews/2') // Carol deletes Alice’s review
      .set('Authorization', 'Bearer fakeToken')
      .expect(204);

    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789', // Carol Admin
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    // Verify review no longer exists
    const response = await request(app)
      .get('/api/users/1/reviews/2') // Assuming a GET review endpoint exists
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('Review with ID "2" is not found');
  });

  test('404: returns error when trying to delete a non-existing review', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123', // Alice
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .delete('/api/users/1/reviews/999') // Review ID does not exist
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('Review with ID "999" is not found');
  });

  test('400: returns error when user ID is NaN', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .delete('/api/users/not-id/reviews/1') // Missing user ID
      .set('Authorization', 'Bearer fakeToken')
      .expect(400);

    expect(response.body.msg).toBe(
      'Bad request : invalid input syntax for type integer: "NaN"'
    );
  });

  test('405: returns error when review ID is missing', async () => {
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .delete('/api/users/1/reviews/') // Missing review ID
      .set('Authorization', 'Bearer fakeToken')
      .expect(405);

    expect(response.body.msg).toBe('Method not allowed');
  });

  test('401: returns error when no authorization token is provided', async () => {
    const response = await request(app)
      .delete('/api/users/1/reviews/1')
      .expect(401);

    expect(response.body.msg).toBe('No token provided');
  });
});

describe('GET /users/firebase/data', () => {
  test('200: returns a user by firebase_uid if request from admin', async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'adminUID789',
      email: 'caroladmin@example.com',
      full_name: 'Carol Admin',
    });

    const response = await request(app)
      .get('/api/users/firebase/data?firebase_uid=userUID123')
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
      .get('/api/users/firebase/data?firebase_uid=userUID123') // Requesting user with ID 1 and it is not the owner of the profile
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('401: if request from the user which is not authorised', async () => {
    const response = await request(app)
      .get('/api/users/firebase/data?firebase_uid=userUID123') // No token in request
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
      .get('/api/users/firebase/data?firebase_uid=userUID123') // Requesting user with ID 1 and it is the owner of the profile
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

describe('GET /users/:user_id/amenities', () => {
  test('200: returns list of preferences for a given user', async () => {
    // Mock Firebase behavior for an authenticated user (Alice - userUID123)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'userUID123',
      email: 'alice@example.com',
      full_name: 'Alice Example',
    });

    const response = await request(app)
      .get('/api/users/1/amenities') // Alice's user_id is 1
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.userAmenities).toEqual([
      {
        name: 'WiFi',
      },
      {
        name: 'Power Outlets',
      },
    ]);
  });

  test('200: returns empty array if user has no preferences', async () => {
    // Mock Firebase behavior for a user with no favorites (Bob - businessUID456)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const response = await request(app)
      .get('/api/users/2/amenities') // Bob's user_id is 2
      .set('Authorization', 'Bearer fakeToken')
      .expect(200);

    expect(response.body.userAmenities).toEqual([]); // Bob has no favorite cafes
  });

  test('401: fails when no authorization token is provided', async () => {
    const response = await request(app)
      .get('/api/users/1/amenities')
      .expect(401);

    expect(response.body.msg).toBe('No token provided');
  });

  test('403: fails when a user tries to access another user’s preferences', async () => {
    // Mock Firebase behavior for a different user (Bob - businessUID456)
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'businessUID456',
      email: 'bobbiz@example.com',
      full_name: 'Bob Business',
    });

    const response = await request(app)
      .get('/api/users/1/amenities') // Bob is trying to access Alice's favorites
      .set('Authorization', 'Bearer fakeToken')
      .expect(403);

    expect(response.body.msg).toBe('Forbidden');
  });

  test('404: fails if user does not exist', async () => {
    // Mock Firebase behavior for an unknown user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: 'nonexistentUID',
      email: 'ghost@example.com',
      full_name: 'Ghost User',
    });

    const response = await request(app)
      .get('/api/users/999/amenities') // User 999 does not exist
      .set('Authorization', 'Bearer fakeToken')
      .expect(404);

    expect(response.body.msg).toBe('User not found, please register first');
  });
});
