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

describe('GET /cafes/map/visible', () => {
  test('200: returns array of cafes from the view port of the map', async () => {
    const response = await request(app)
      .get(
        '/api/cafes/map/visible?minLat=53.46&maxLat=53.49&minLon=-2.26&maxLon=-2.23'
      )
      .expect(200);

    expect(response.body.cafes).toEqual([
      {
        id: 1,
        name: 'Remote Bean Central',
        description: 'A cozy cafe for remote workers',
        address: '123 Coffee St, Manchester',
        busy_status: 'quiet',
        is_verified: false,
        created_at: expect.any(String),
        latitude: 53.4808,
        longitude: -2.2426,
      },
      {
        id: 2,
        name: 'Mocha Lounge',
        description: 'Perfect Wi-Fi and relaxed vibe',
        address: '24 Latte Lane, Manchester',
        busy_status: 'moderate',
        is_verified: false,
        created_at: expect.any(String),
        latitude: 53.4837,
        longitude: -2.25,
      },
      {
        id: 3,
        name: 'Focus & Froth',
        description: 'Enjoy coworking space with great cappuccinos',
        address: '78 Espresso Road, Manchester',
        busy_status: 'busy',
        is_verified: false,
        created_at: expect.any(String),
        latitude: 53.47,
        longitude: -2.237,
      },
    ]);
  });
});

describe('GET /cafes/map/radius', () => {
  test('200: returns array of cafes located in the area within provided radius from gpc location on the map', async () => {
    const response = await request(app)
      .get('/api/cafes/map/radius?lat=53.4808&lon=-2.2426&radius=1000')
      .expect(200);

    expect(response.body.cafes).toEqual([
      {
        id: 1,
        name: 'Remote Bean Central',
        description: 'A cozy cafe for remote workers',
        address: '123 Coffee St, Manchester',
        busy_status: 'quiet',
        is_verified: false,
        created_at: expect.any(String),
        latitude: 53.4808,
        longitude: -2.2426,
      },
      {
        id: 2,
        name: 'Mocha Lounge',
        description: 'Perfect Wi-Fi and relaxed vibe',
        address: '24 Latte Lane, Manchester',
        busy_status: 'moderate',
        is_verified: false,
        created_at: expect.any(String),
        latitude: 53.4837,
        longitude: -2.25,
      },
    ]);
  });
});
