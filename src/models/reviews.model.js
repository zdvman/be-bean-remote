const db = require("./../db/connection.js");

const selectReviewsByCafeId = ({ cafe_id }) => {
  return db
    .query(`SELECT * FROM reviews WHERE cafe_id =$1`, [cafe_id])

    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No article found for article_id: ${cafe_id}`,
        });
      }
      return rows;
    });
};

module.exports = { selectReviewsByCafeId };
