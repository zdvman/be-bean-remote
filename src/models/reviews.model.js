const {
  checkUserExists,
  checkCafeExists,
  checkReviewExists,
} = require('../db/seeds/utils.js');
const db = require('./../db/connection.js');

const selectReviewsByCafeId = ({ cafe_id }) => {
  return checkCafeExists(cafe_id).then(() => {
    return db
      .query(`SELECT * FROM reviews WHERE cafe_id =$1`, [cafe_id])
      .then(({ rows }) => {
        return rows;
      });
  });
};

const selectReviewByReviewId = ({ review_id }) => {
  return db
    .query(`SELECT * FROM reviews WHERE id =$1`, [review_id])

    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No reviews found for id: ${review_id}`,
        });
      }
      return rows;
    });
};

const selectVotesByReviewId = ({ review_id }) => {
  return db
    .query(`SELECT * FROM review_votes WHERE review_id =$1`, [review_id])
    .then(({ rows }) => {
      return rows;
    });
};

const insertReview = (
  { cafe_id },
  { rating, review_text },
  { id: user_id }
) => {
  if (!cafe_id) {
    return Promise.reject({
      status: 400,
      msg: 'Cafe ID is missing',
    });
  }
  if (!rating || rating < 1 || rating > 5) {
    return Promise.reject({
      status: 400,
      msg: 'Rating must be between 1 and 5',
    });
  }
  if (!review_text) {
    return Promise.reject({
      status: 400,
      msg: 'Review text is missing',
    });
  }
  if (!user_id) {
    return Promise.reject({
      status: 400,
      msg: 'User ID is missing',
    });
  }
  return checkCafeExists(cafe_id).then(() => {
    const sql = `INSERT INTO reviews (user_id, cafe_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *;`;
    return db
      .query(sql, [user_id, cafe_id, rating, review_text])
      .then(({ rows }) => {
        return rows[0];
      });
  });
};

const removeReview = ({ review_id }) => {
  if (!review_id) {
    return Promise.reject({
      status: 400,
      msg: 'Review ID is missing',
    });
  }
  return db
    .query('DELETE FROM reviews WHERE id = $1;', [review_id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: `No review found for id: ${id}`,
        });
      }
      return;
    });
};

function selectReviewVoteByUserOnReview({ id: user_id }, { review_id }) {
  if (!user_id) {
    return Promise.reject({
      status: 400,
      msg: 'Missing user_id',
    });
  }
  if (!review_id) {
    return Promise.reject({
      status: 400,
      msg: 'Missing review_id',
    });
  }
  const sql = `SELECT vote_type FROM review_votes WHERE user_id = $1 AND review_id = $2;`;
  return db.query(sql, [user_id, review_id]).then(({ rows }) => {
    return rows.length > 0 ? rows[0].vote_type : null;
  });
}

// Handle votes on reviews

function selectReviewVote(user_id, review_id) {
  const sql = `SELECT vote_type FROM review_votes WHERE user_id = $1 AND review_id = $2;`;
  return db.query(sql, [user_id, review_id]).then(({ rows }) => {
    return rows.length > 0 ? rows[0].vote_type : null;
  });
}

function insertReviewVote(user_id, review_id, vote_type) {
  const sql = `INSERT INTO review_votes (user_id, review_id, vote_type) VALUES ($1, $2, $3) RETURNING *;`;
  return db.query(sql, [user_id, review_id, vote_type]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `No review found for review_id: ${review_id}`,
      });
    }
    return rows[0]?.vote_type;
  });
}

function updateReviewVote(user_id, review_id, vote_type) {
  const sql = `UPDATE review_votes SET vote_type = $1 WHERE user_id = $2 AND review_id = $3 RETURNING *;`;
  return db.query(sql, [vote_type, user_id, review_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `No vote found for user_id: ${user_id} and review_id: ${review_id}`,
      });
    }
    return rows[0]?.vote_type;
  });
}

function deleteReviewVote(user_id, review_id) {
  const sql = `DELETE FROM review_votes WHERE user_id = $1 AND review_id = $2;`;
  return db.query(sql, [user_id, review_id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      return Promise.reject({
        status: 404,
        msg: `No vote found for user_id: ${user_id} and review_id: ${review_id}`,
      });
    }
    return null;
  });
}

function updateHelpfulCount(review_id, increment, new_vote_type) {
  if (increment === 0) {
    const sql = `SELECT helpful_count FROM reviews WHERE id = $1;`;
    return db.query(sql, [review_id]).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No review found for review_id: ${review_id}`,
        });
      }
      return {
        vote_type: new_vote_type,
        helpful_count: rows[0].helpful_count,
      };
    });
  } else {
    const sql = `UPDATE reviews SET helpful_count = helpful_count + $1 WHERE id = $2 RETURNING *;`;
    return db.query(sql, [increment, review_id]).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `No review found for review_id: ${review_id}`,
        });
      }
      return {
        vote_type: new_vote_type,
        helpful_count: rows[0].helpful_count,
      };
    });
  }
}

function countVotesByType({ review_id }, { type: vote_type }) {
  if (!review_id) {
    return Promise.reject({
      status: 400,
      msg: 'Missing review_id',
    });
  }
  if (!vote_type || !['helpful', 'unhelpful'].includes(vote_type)) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid vote type',
    });
  }

  return checkReviewExists(review_id).then(() => {
    if (vote_type === 'helpful') {
      const sql = `SELECT helpful_count FROM reviews WHERE id = $1;`;
      return db.query(sql, [review_id]).then(({ rows }) => {
        return rows[0].helpful_count;
      });
    } else {
      const sql = `SELECT COUNT(*) FROM review_votes WHERE review_id = $1 AND vote_type = $2;`;
      return db.query(sql, [review_id, vote_type]).then(({ rows }) => {
        return rows[0].count;
      });
    }
  });
}

function handleVote(
  { review_id },
  { id: user_id },
  { type: desired_vote_type }
) {
  if (!review_id) {
    return Promise.reject({
      status: 400,
      msg: 'Missing review_id',
    });
  }
  if (!user_id) {
    return Promise.reject({
      status: 400,
      msg: 'Missing user_id',
    });
  }
  if (
    ['helpful', 'unhelpful'].includes(desired_vote_type) === false ||
    !desired_vote_type
  ) {
    return Promise.reject({
      status: 400,
      msg: 'Invalid vote type',
    });
  }
  let currentVoteType;
  return Promise.all([checkUserExists(user_id), checkReviewExists(review_id)])
    .then(() => {
      return selectReviewVote(user_id, review_id);
    })
    .then((vote_type) => {
      currentVoteType = vote_type;
      // If no vote exists for current user on this review, insert a new vote
      if (vote_type === null) {
        return insertReviewVote(user_id, review_id, desired_vote_type);
      }
      // If the current user's vote on current review matches the desired vote, delete the vote
      else if (vote_type === desired_vote_type) {
        return deleteReviewVote(user_id, review_id);
      }
      // If the current user's vote on current review does not match the desired vote, update the vote
      else {
        return updateReviewVote(user_id, review_id, desired_vote_type);
      }
    })
    .then((new_vote_type) => {
      const increment = handleIncrement(currentVoteType, desired_vote_type);
      return updateHelpfulCount(review_id, increment, new_vote_type);
    });
}

function handleIncrement(currentVoteType, desired_vote_type) {
  let increment = 0;
  // Increment helpful_count if the vote is 'helpful'
  if (currentVoteType === null && desired_vote_type === 'helpful') {
    increment = 1;
  }
  // Decrement helpful_count if the vote is 'helpful'
  else if (
    currentVoteType === desired_vote_type &&
    desired_vote_type === 'helpful'
  ) {
    increment = -1;
  } else {
    // Increment helpful_count if the vote is 'helpful'
    if (desired_vote_type === 'helpful' && currentVoteType !== 'helpful') {
      increment = 1;
    }
    // Decrement helpful_count if the vote is not 'helpful'
    else if (desired_vote_type !== 'helpful' && currentVoteType === 'helpful') {
      increment = -1;
    }
  }
  return increment;
}

module.exports = {
  selectReviewsByCafeId,
  selectReviewByReviewId,
  selectVotesByReviewId,
  insertReview,
  removeReview,
  selectReviewVote,
  insertReviewVote,
  updateReviewVote,
  deleteReviewVote,
  updateHelpfulCount,
  countVotesByType,
  handleVote,
  selectReviewVoteByUserOnReview,
};
