const db = require('../db/connection');

function fetchCafes() {
    const sql = `SELECT * FROM cafes`;
    return db.query(sql).then(({ rows }) => {
      return rows;
    });
}

module.exports = {
  fetchCafes
};