const db = require('../db/connection');

function selectVisitsByUser( user_id ) {
    const sql = `SELECT * FROM cafe_visits WHERE user_id = $1`;
    return db.query(sql, [user_id]).then(({ rows }) => {
      return rows;
    });
}

function insertVisit({user_id, cafe_id }) {
  const sql = `INSERT INTO cafe_visits (user_id, cafe_id, visited_at) VALUES ($1, $2, $3) RETURNING *;`;
    return db.query(sql, [user_id, cafe_id, new Date().toISOString()]).then(({ rows }) => {
      return rows[0];
    });
}

module.exports = {
    selectVisitsByUser,
    insertVisit
};