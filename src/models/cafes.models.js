const db = require('../db/connection');

function selectCafes() {
    const sql = `SELECT * FROM cafes ORDER BY id ASC`;
    return db.query(sql).then(({ rows }) => {
      return rows;
    });
}

module.exports = {
  selectCafes
};