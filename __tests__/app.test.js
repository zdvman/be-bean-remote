// __tests__/app.test.js
// Mock the firebase-admin module
jest.mock("firebase-admin", () => ({
  auth: jest.fn().mockReturnThis(),
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
}));

const firebaseAdmin = require("firebase-admin");
const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../src/app.js");
const db = require("../src/db/connection.js");
const testData = require("../src/db/data/test-data/index.js");
const seed = require("../src/db/seeds/seed.js");
require("jest-sorted");

afterAll(async () => {
  await db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /users", () => {
  beforeAll(async () => {
    await seed(testData);
  });

  test("200: returns array of users if the user is admin", async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: "adminUID789",
      email: "caroladmin@example.com",
      full_name: "Carol Admin",
    });

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer fakeToken")
      .expect(200);

    expect(Array.isArray(response.body.users)).toBe(true);
  });

  test("403: forbidden if the user is not admin", async () => {
    // Mock Firebase behavior for a non-admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: "userUID123",
      email: "alice@example.com",
      full_name: "Alice Example",
    });

    const response = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer fakeToken")
      .expect(403);

    expect(response.body.msg).toBe("Forbidden");
  });

  test("401: no token provided", async () => {
    const response = await request(app).get("/api/users").expect(401);
    expect(response.body.msg).toBe("No token provided");
  });
});
describe("", () => {
  beforeAll(async () => {
    await seed(testData);
  });
  test("200: should respond with an object containing cafe id", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body }) => {
        review = body.reviews[0];
        expect(review).toMatchObject({
          id: 1,
          user_id: 1, // Alice
          cafe_id: 1, // Remote Bean Central
          rating: 5,
          review_text: "Fantastic coffee, great atmosphere!",
          helpful_count: 0,
          created_at: expect.any(String),
        });
      });
  });

  test("400: should respond with Bad request", () => {
    return request(app)
      .get("/api/reviews/fdnjnk")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("200: should respond with an object containing id", () => {
    return request(app)
      .get("/api/reviews/1")
      .expect(200)
      .then(({ body }) => {
        review = body.reviews[0];
        expect(review.id).toBe(1);
      });
  });

  test("201: Post a new user and return new user", async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: "userUID791",
      email: "newuser2@example.com",
      full_name: "Dmytro User",
    });

    const response = await request(app)
      .post("/api/users")
      .set("Authorization", "Bearer fakeToken")
      .expect(201);

    expect(response.body.user).toEqual({
      id: expect.any(Number),
      firebase_uid: "userUID791",
      email: "newuser2@example.com",
      full_name: "Dmytro User",
      avatar: "https://avatars.githubusercontent.com/u/17879520?v=4",
      role: "user",
      location: null,
      points: 0,
      badges: [],
      notification_preferences: {},
      fcm_token: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  test("201: Post one more new user and return new user", async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: "userUID790",
      email: "newuser@example.com",
      full_name: "Luca User",
    });

    const response = await request(app)
      .post("/api/users")
      .set("Authorization", "Bearer fakeToken")
      .expect(201);

    expect(response.body.user).toEqual({
      id: expect.any(Number),
      firebase_uid: "userUID790",
      email: "newuser@example.com",
      full_name: "Luca User",
      avatar: "https://avatars.githubusercontent.com/u/17879520?v=4",
      role: "user",
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

describe("GET /users/:id", () => {
  beforeAll(async () => {
    await seed(testData);
  });

  test("200: returns a user by user_id if request from admin", async () => {
    // Mock Firebase behavior for an admin user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: "adminUID789",
      email: "caroladmin@example.com",
      full_name: "Carol Admin",
    });

    const response = await request(app)
      .get("/api/users/1")
      .set("Authorization", "Bearer fakeToken")
      .expect(200);

    expect(response.body.user).toEqual({
      id: 1,
      firebase_uid: "userUID123",
      email: "alice@example.com",
      full_name: "Alice Example",
      avatar: "https://example.com/alice.png",
      role: "user",
      location: "0101000020E6100000FE43FAEDEBC0F8BF8351499D80E64A40",
      points: 50,
      badges: ["Helpful Reviewer"],
      notification_preferences: { email: true, push: false },
      fcm_token: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  test("403: if request from the user which is not the owner of the profile it is forbidden", async () => {
    // Mock Firebase behavior for an business user
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: "businessUID456",
      email: "caroladbobbiz@example.com",
      full_name: "Bob Business",
    });

    const response = await request(app)
      .get("/api/users/1") // Requesting user with ID 1 and it is not the owner of the profile
      .set("Authorization", "Bearer fakeToken")
      .expect(403);

    expect(response.body.msg).toBe("Forbidden");
  });

  test("401: if request from the user which is not authorised", async () => {
    const response = await request(app)
      .get("/api/users/1") // No token in request
      .expect(401);

    expect(response.body.msg).toBe("No token provided");
  });

  test("200: returns a user by user_id if request from the user himself", async () => {
    // Mock Firebase behavior for an user - the owner of the profile
    firebaseAdmin.auth().verifyIdToken = jest.fn().mockResolvedValueOnce({
      uid: "userUID123",
      email: "alice@example.com",
      full_name: "Alice Example",
    });

    const response = await request(app)
      .get("/api/users/1") // Requesting user with ID 1 and it is the owner of the profile
      .set("Authorization", "Bearer fakeToken")
      .expect(200);

    expect(response.body.user).toEqual({
      id: 1,
      firebase_uid: "userUID123",
      email: "alice@example.com",
      full_name: "Alice Example",
      avatar: "https://example.com/alice.png",
      role: "user",
      location: "0101000020E6100000FE43FAEDEBC0F8BF8351499D80E64A40",
      points: 50,
      badges: ["Helpful Reviewer"],
      notification_preferences: { email: true, push: false },
      fcm_token: null,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });
});

describe("GET /cafes", () => {
  test("200: Responds with an object containing all cafes", () => {
    return request(app)
      .get("/api/cafes")
      .expect(200)
      .then((response) => {
        const cafesArr = response.body.cafes;
        expect(Array.isArray(cafesArr)).toBe(true);
        expect(cafesArr[0].owner_id).toBe(2);
        expect(cafesArr[0].name).toBe("Remote Bean Central");
        expect(cafesArr[0].description).toBe("A cozy cafe for remote workers");
        expect(cafesArr[0].address).toBe("123 Coffee St, Manchester");
        // expect(cafesArr[0].location).toEqual({
        //   type: 'Point',
        //   coordinates: [-2.2426, 53.4808],
        // });
        expect(cafesArr[0].busy_status).toBe("quiet");
        expect(cafesArr[0].is_verified).toBe(false);
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
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

  

describe("GET /api/cafes sorting queries",() => {
  test("200: Responds with all cafes with a certain amenity", () => {
    return request(app)
    .get('/api/cafes?amenity=WiFi')
    .expect(200)
    .then(({body}) => {
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
          is_verified: expect.any(Boolean)
        });
      });
    })
  });
  test("404: returns an error 404 when no cafes have this amenity", () => {
    return request(app)
    .get('/api/cafes?amenity=Outdoor%20Seating')
    .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('No cafes with this amenity');
      });
  })
});

describe("GET /api/cafes/:cafe_id/amenities",() => {
  test("200: Responds with all amenities of a certain cafe", () => {
    const result = {
      cafe_id: '1',
      amenities: [ { name: 'WiFi' }, { name: 'Power Outlets' } ]
    };
    return request(app)
    .get('/api/cafes/1/amenities')
    .expect(200)
    .then(({body}) => {
      expect(body).toEqual(result)
    })
  });
  test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
  return request(app)
    .get('/api/cafes/999/amenities')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('No cafe found for cafe_id: 999');
    });
});
test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
  return request(app)
    .get('/api/cafes/not-a-cafe/amenities')
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request');
    });
});
});
