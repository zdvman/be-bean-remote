const db = require("./../db/connection.js");

const selectReviewsByCafeId = ({ cafe_id }) => {
  return db
    .query(`SELECT * FROM reviews WHERE cafe_id =$1`, [cafe_id])

    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No reviews found for cafe_id: ${cafe_id}`,
        });
      }
      return rows;
    });
};

const selectReviewsById = ({ id }) => {
  return db
    .query(`SELECT * FROM reviews WHERE id =$1`, [id])

    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No reviews found for id: ${id}`,
        });
      }
      return rows;
    });
};

const selectVotesByReviewId = ({ review_id }) => {
  return db
    .query(`SELECT * FROM review_votes WHERE review_id =$1`, [review_id])

    .then(({ rows }) => {
      if (rows.length === 0) {
        return [];
      }

      return rows;
    });
};

module.exports = {
  selectReviewsByCafeId,
  selectReviewsById,
  selectVotesByReviewId,
};
