const db = require('../db/connection');

function selectCafes() {
    const sql = `SELECT * FROM cafes ORDER BY id ASC`;
    return db.query(sql).then(({ rows }) => {
      return rows;
    });
}

function selectCafeByID(cafe_id) {
    const sql = `SELECT * FROM cafes WHERE id=$1`;
    const args = [cafe_id]
    return db.query(sql, args).then(({ rows }) => {
        if (!rows[0]) {
            return Promise.reject({
              status: 404,
              msg: `No cafe found for cafe_id: ${cafe_id}`
            });
          }
      return rows[0];
    });
}

function selectCafesByAmenity(amenity) {
    const queryStr = `
    SELECT DISTINCT cafes.*
    FROM cafes
    JOIN cafe_amenities ON cafes.id = cafe_amenities.cafe_id
    JOIN amenities ON cafe_amenities.amenity_id = amenities.id
    WHERE amenities.name = $1;
    `
    const args = [amenity];
    return db.query(queryStr, args).then(({ rows }) => {
      return rows;
    })
}

function selectAmenitiesByCafeId(id) {
    const queryStr = `
    SELECT amenities.name
    FROM amenities
    JOIN cafe_amenities ON amenities.id = cafe_amenities.amenity_id
    WHERE cafe_amenities.cafe_id = $1;
    `
    const args = [id]
    return db.query(queryStr, args).then(({ rows }) => {
        return rows;
      })
}

module.exports = {
  selectCafes,
  selectCafeByID,
  selectCafesByAmenity,
  selectAmenitiesByCafeId
};