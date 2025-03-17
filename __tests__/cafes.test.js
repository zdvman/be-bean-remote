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

beforeAll(async () => {
  await seed(testData);
});

afterAll(async () => {
  await db.end();
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
        expect(cafesArr[0].location).toBe(
          '0101000020E6100000A913D044D8F001C05AF5B9DA8ABD4A40'
        );
        expect(cafesArr[0].busy_status).toBe('quiet');
        expect(cafesArr[0].is_verified).toBe(false);
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
      .get('/api/cafes/999')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('No cafe found for cafe_id: 999');
      });
  });
  test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
    return request(app)
      .get('/api/cafes/not-a-cafe')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: "not-a-cafe"'
        );
      });
  });
});

  describe('GET /cafes/:cafe_id', () => {
  
    test("200: Responds with a single cafe", () => {
      return request(app)
        .get("/api/cafes/1")
        .expect(200)
        .then((response) => {
          const cafe = response.body.cafe;
          expect(cafe.owner_id).toBe(2);
          expect(cafe.name).toBe('Remote Bean Central');
          expect(cafe.description).toBe("A cozy cafe for remote workers");
          expect(cafe.address).toBe("123 Coffee St, Manchester");
          expect(cafe.busy_status).toBe("quiet");
          expect(cafe.is_verified).toBe(false);
        });
    });
  
    test("GET:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
      return request(app)
        .get("/api/cafes/999")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("No cafe found for cafe_id: 999");
        });
    });
    test("GET:400 sends an appropriate status and error message when given an invalid id", () => {
      return request(app)
        .get("/api/cafes/not-a-cafe")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request : invalid input syntax for type integer: \"not-a-cafe\"");
        });
    });
  });
});

describe('GET /api/cafes sorting queries', () => {
  test('200: Responds with all cafes with a certain amenity', () => {
    return request(app)
      .get('/api/cafes?amenity=WiFi')
      .expect(200)
      .then(({ body }) => {
        expect(body.cafes).toBeInstanceOf(Array);
        expect(body.cafes.length).toBeGreaterThan(0);
        body.cafes.forEach((cafe) => {
          expect(cafe).toMatchObject({
            owner_id: expect.any(Number),
            name: expect.any(String),
            description: expect.any(String),
            address: expect.any(String),
            location: expect.any(String),
            busy_status: expect.any(String),
            is_verified: expect.any(Boolean),
          });
        });
      });
  });
  test('404: returns an empty array when no cafes have this amenity', () => {
    return request(app)
      .get('/api/cafes?amenity=Outdoor%20Seating')
      .expect(200)
      .then((response) => {
        expect(response.body.cafes).toEqual([]);
      });
  });
});

describe('GET /api/cafes/:cafe_id/amenities', () => {
  test('200: Responds with all amenities of a certain cafe', () => {
    const result = [{ name: 'WiFi' }, { name: 'Power Outlets' }];
    return request(app)
      .get('/api/cafes/1/amenities')
      .expect(200)
      .then(({ body }) => {
        expect(body.amenities).toEqual(result);
      });
  });
  test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
    return request(app)
      .get('/api/cafes/999/amenities')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('Cafe with ID "999" is not found');
      });
  });
  test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
    return request(app)
      .get('/api/cafes/not-a-cafe/amenities')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe(
          'Bad request : invalid input syntax for type integer: \"not-a-cafe\"'
        );
      });
  });
});
