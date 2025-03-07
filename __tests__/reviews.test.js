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
  
  afterAll(async () => {
    await db.end();
  });
  
  describe("GET cafes/:id/reviews", () => {
    beforeAll(async () => {
        await seed(testData);
      });
    test("200: Responds with an object containing all reviews of a specific cafe", () => {
      return request(app)
        .get("/api/cafes/1/reviews")
        .expect(200)
        .then((res) => {
            const reviews = res.body.reviews;
            expect
            reviews.forEach((comment) => {
            expect(comment).toMatchObject({
            user_id: expect.any(Number),
            cafe_id: expect.any(Number),
            rating: expect.any(Number),
            review_text: expect.any(String),
            helpful_count: expect.any(Number)
          });
        })
        })
    });
    test("GET:404 sends an appropriate status and error message when given a valid but non-existent id", () => {
        return request(app)
          .get("/api/cafes/999/reviews")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Cafe with ID \"999\" is not found");
          });
      });
      test("GET:400 sends an appropriate status and error message when given an invalid id", () => {
        return request(app)
          .get("/api/cafes/not-a-cafe/reviews")
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("GET:404 sends an appropriate status and error message when given a cafe with no reviews", () => {
        return request(app)
          .get("/api/cafes/3/reviews")
          .expect(404)
          .then((response) => {
            console.log(response);
            expect(response.body.msg).toBe("No reviews found for cafe_id: 3");
          });
      });
  });

  describe("POST: api/cafes/:cafe_id/reviews", () => {
    beforeAll(async () => {
        await seed(testData);
      });
    test("return the new review", () => {
      return request(app)
      .post("/api/cafes/3/reviews")
        .send({
          user_id: 2,
          rating: 5,
          review_text: 'Fantastic coffee, great atmosphere!'
        })
        .expect(201)
        .then((res) => {
          expect(res.body.review).toMatchObject({
            user_id: 2,
            cafe_id: 3,
            rating: 5,
            review_text: 'Fantastic coffee, great atmosphere!',
            helpful_count: 0,
          });
        });
    });
    test("400: responds with an error if user_id is missing", () => {
      return request(app)
        .post("/api/cafes/3/reviews")
        .send({
            rating: 5,
            review_text: 'Fantastic coffee, great atmosphere!'
          }) // Missing user_id
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad request");
        });
    });
    
    test("404: responds with an error if user_id does not exist", () => {
      return request(app)
        .post("/api/cafes/3/reviews")
        .send({
            user_id: 4,
            rating: 5,
            review_text: 'Fantastic coffee, great atmosphere!'
          }) // Non-existent user
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Not found");
        });
    });
    
    test("404: responds with an error if cafe_id does not exist", () => {
      return request(app)
        .post("/api/cafes/4/reviews")
        .send({
            user_id: 2,
            rating: 5,
            review_text: 'Fantastic coffee, great atmosphere!'
          }) // Non-existent cafe
        .expect(404)
        .then((res) => {
          expect(res.body.msg).toBe("Not found");
        });
    });
    test("400: responds with an error if user_id is not an integer", () => {
      return request(app)
        .post("/api/cafes/3/reviews")
        .send({
            user_id: "abc",
            rating: 5,
            review_text: 'Fantastic coffee, great atmosphere!'
          }) // Invalid user_id
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad request");
        });
    });
    
    test("400: responds with an error if cafe_id is not an integer", () => {
      return request(app)
        .post("/api/cafes/abc/reviews")
        .send({
            user_id: 2,
            rating: 5,
            review_text: 'Fantastic coffee, great atmosphere!'
          }) // Invalid cafe_id
        .expect(400)
        .then((res) => {
          expect(res.body.msg).toBe("Bad request");
        });
    });   
  })

  