const db = require('../connection');

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  const timestamp = new Date(created_at);
  return { created_at: timestamp, ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

exports.checkUserExists = (id) => {
  const sql = `SELECT id FROM users WHERE id = $1`;
  return db.query(sql, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `User with ID "${id}" is not found`,
      });
    }
    return Promise.resolve(); // ✅ Ensure it returns a Promise
  });
};

exports.checkCafeExists = (id) => {
  const sql = `SELECT id FROM cafes WHERE id = $1`;
  return db.query(sql, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `Cafe with ID "${id}" is not found`,
      });
    }
    return Promise.resolve();
  });
};

exports.checkCafeIsAlreadyInFavourites = (user_id, cafe_id) => {
  const sql = `SELECT 1 FROM user_favorites WHERE user_id = $1 AND cafe_id = $2`;
  return db.query(sql, [user_id, cafe_id]).then(({ rows }) => {
    if (rows.length > 0) {
      return Promise.reject({
        status: 409,
        msg: `Cafe with ID "${cafe_id}" is already in favourites`,
      });
    }
    return Promise.resolve();
  });
};

exports.checkReviewExists = (id) => {
  const sql = `SELECT id FROM reviews WHERE id = $1`;
  return db.query(sql, [id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `Review with ID "${id}" is not found`,
      });
    }
    return Promise.resolve();
  });
};

exports.checkAmenityExists = (amenity) => {
  const sql = `SELECT name FROM amenities WHERE name = $1`;
  return db.query(sql, [amenity]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        status: 404,
        msg: `Amenity "${amenity}" is not found`,
      });
    }
    return Promise.resolve();
  });
}
