const db = require("./../db/connection.js");

const selectReviewsByCafeId = ({ id }) => {
  return db
    .query(`SELECT * FROM reviews WHERE cafe_id =$1`, [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No reviews found for cafe_id: ${id}`,
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

const insertReview = ({ user_id, rating, review_text }, id) => {
  const sql = `INSERT INTO reviews (user_id, cafe_id, rating, review_text, helpful_count) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;
    return db.query(sql, [user_id, id, rating, review_text, 0]).then(({ rows }) => {
      return rows[0];
    });
}

const removeReview = (id) => {
  return db
    .query('DELETE FROM reviews WHERE id = $1;', [id]);
}

module.exports = {
  selectReviewsByCafeId,
  selectReviewsById,
  selectVotesByReviewId,
  insertReview,
  removeReview
};
