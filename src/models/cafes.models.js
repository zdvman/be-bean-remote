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

module.exports = {
  selectCafes,
  selectCafeByID
};