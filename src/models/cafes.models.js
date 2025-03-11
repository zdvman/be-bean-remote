const db = require('../db/connection');
const { checkCafeExists, checkAmenityExists } = require('../db/seeds/utils');

function selectCafes() {
  const sql = `SELECT * FROM cafes ORDER BY id ASC`;
  return db.query(sql).then(({ rows }) => {
    return rows;
  });
}

function insertCafe(
  { name, description, address, location },
  { id: owner_id }
) {
  if (
    !owner_id ||
    !name ||
    !address ||
    !description ||
    !location?.coordinates
  ) {
    return Promise.reject({ msg: 'Missing required fields', status: 400 });
  }

  /*if (typeof longitude !== "number" || typeof latitude !== "number") {
    throw new Error("Invalid coordinates format. Coordinates must be numbers.");
  }*/

  const geoJson = location ? JSON.stringify(cafe.location) : null;
  const sql = `
    INSERT INTO cafes
    (owner_id, name, description, address, location)
    VALUES
    ($1, $2, $3, $4, ST_GeomFromGeoJSON($5)::geography)
    RETURNING *;
  `;
  const args = [owner_id, name, description, address, geoJson];

  return db.query(sql, args).then(({ rows }) => {
    return rows[0];
  });
}

function selectCafeByCafeId({ cafe_id }) {
  if (!cafe_id) {
    return Promise.reject({
      msg: 'Cafe ID is missing',
      status: 400,
    });
  }
  const sql = `SELECT * FROM cafes WHERE id=$1`;
  const args = [cafe_id];
  return db.query(sql, args).then(({ rows }) => {
    if (!rows[0]) {
      return Promise.reject({
        status: 404,
        msg: `No cafe found for cafe_id: ${cafe_id}`,
      });
    }
    return rows[0];
  });
}

function selectCafesByAmenity({ amenity }) {
  if (!amenity) {
    return Promise.reject({
      msg: 'Amenity is missing',
      status: 400,
    });
  }
  return checkAmenityExists(amenity).then(() => {
    const queryStr = `
    SELECT DISTINCT cafes.*
    FROM cafes
    JOIN cafe_amenities ON cafes.id = cafe_amenities.cafe_id
    JOIN amenities ON cafe_amenities.amenity_id = amenities.id
    WHERE amenities.name = $1;
    `;
    const args = [amenity];
    return db.query(queryStr, args).then(({ rows }) => {
      return rows;
    });
  });
}

function selectAmenitiesByCafeId({ cafe_id }) {
  if (!cafe_id) {
    return Promise.reject({
      msg: 'Cafe ID is missing',
      status: 400,
    });
  }
  return checkCafeExists(cafe_id).then(() => {
    const queryStr = `
    SELECT amenities.name
    FROM amenities
    JOIN cafe_amenities ON amenities.id = cafe_amenities.amenity_id
    WHERE cafe_amenities.cafe_id = $1;
    `;
    const args = [cafe_id];
    return db.query(queryStr, args).then(({ rows }) => {
      return rows;
    });
  });
}

function selectCafesByCoordinates({ minLat, maxLat, minLon, maxLon }) {
  const params = [minLon, minLat, maxLon, maxLat].map(Number);
  if (params.some(isNaN)) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid coordinates',
    });
  }
  const sql = `
  SELECT 
    id, 
    name, 
    description, 
    address, 
    busy_status, 
    is_verified, 
    created_at,
    ST_Y(location::geometry) AS latitude,
    ST_X(location::geometry) AS longitude
  FROM cafes
  WHERE ST_Covers(
    ST_GeogFromText('POLYGON((' || $1 || ' ' || $2 || ', ' || $3 || ' ' || $2 || ', ' || $3 || ' ' || $4 || ', ' || $1 || ' ' || $4 || ', ' || $1 || ' ' || $2 || '))'),
    location
  )
  `;
  return db.query(sql, params).then(({ rows }) => {
    return rows;
  });
}

function selectCafesByRadius({ lat, lon, radius }) {
  const params = [lon, lat, radius].map(Number);
  if (params.some(isNaN)) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid coordinates',
    });
  }
  const sql = `
  SELECT 
    id, 
    name, 
    description, 
    address, 
    busy_status, 
    is_verified, 
    created_at,
    ST_Y(location::geometry) AS latitude,
    ST_X(location::geometry) AS longitude
  FROM cafes
  WHERE ST_DWithin(
    ST_GeogFromText('POINT(' || $1 || ' ' || $2 || ')'),
    location,
    $3
  )
  `;
  return db.query(sql, params).then(({ rows }) => {
    return rows;
  });
}

module.exports = {
  selectCafes,
  selectCafeByCafeId,
  selectCafesByAmenity,
  selectAmenitiesByCafeId,
  insertCafe,
  selectCafesByCoordinates,
  selectCafesByRadius,
};
