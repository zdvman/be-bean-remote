const db = require('../db/connection');

function selectVisitsByUser( user_id ) {
    const sql = `SELECT * FROM cafe_visits WHERE user_id = $1`;
    return db.query(sql, [user_id]).then(({ rows }) => {
      return rows;
    });
}

module.exports = {
    selectVisitsByUser
};