const db = require('../db/connection');
const {
  checkUserExists,
  checkCafeExists,
  checkCafeIsAlreadyInFavourites,
} = require('../db/seeds/utils');

function selectUsers() {
  const sql = `SELECT * FROM users`;
  return db.query(sql).then(({ rows }) => {
    return rows;
  });
}

function insertUser({ uid, email, full_name }) {
  const sql = `INSERT INTO users (firebase_uid, email, full_name) VALUES ($1, $2, $3) RETURNING *`;
  const args = [uid, email, full_name];
  return db.query(sql, args).then(({ rows }) => {
    return rows[0];
  });
}

function selectUserByUserId({ user_id }) {
  if (!user_id) {
    return Promise.reject({
      msg: 'User ID is missing',
      status: 400,
    });
  }
  const sql = `SELECT * FROM users WHERE users.id = $1`;
  const args = [user_id];
  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `User with ID "${user_id}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function updateUserByUserId(
  { user_id }, // Extract user ID from request params
  {
    // Extract fields to be updated from request body
    full_name,
    avatar,
    location,
    points,
    badges,
    notification_preferences,
    fcm_token,
  }
) {
  if (!user_id) {
    return Promise.reject({
      msg: 'User ID is missing',
      status: 400,
    });
  }
  // Prepare SQL dynamically based on provided fields
  const fields = [];
  const values = [];
  let counter = 1;

  if (full_name) {
    fields.push(`full_name = $${counter++}`);
    values.push(full_name);
  }
  if (avatar) {
    fields.push(`avatar = $${counter++}`);
    values.push(avatar);
  }
  if (location) {
    fields.push(`location = ST_GeomFromText($${counter++}, 4326)`);
    values.push(`POINT(${location.longitude} ${location.latitude})`);
  }
  if (points !== undefined) {
    fields.push(`points = $${counter++}`);
    values.push(points);
  }
  if (badges) {
    fields.push(`badges = $${counter++}`);
    values.push(badges);
  }
  if (notification_preferences) {
    fields.push(`notification_preferences = $${counter++}`);
    values.push(notification_preferences);
  }
  if (fcm_token) {
    fields.push(`fcm_token = $${counter++}`);
    values.push(fcm_token);
  }

  if (fields.length === 0) {
    return Promise.reject({
      msg: 'No valid fields provided for update',
      status: 400,
    });
  }

  values.push(user_id);

  const sql = `
    UPDATE users
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${counter}
    RETURNING *;
  `;

  return db.query(sql, values).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `User with ID "${user_id}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function updateUserAmenitiesByUserId({ user_id }, { amenities }) {
  if (!user_id) {
    return Promise.reject({
      msg: 'User ID is missing',
      status: 400,
    });
  }
  if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
    return Promise.reject({
      msg: 'Amenities list is empty or invalid',
      status: 400,
    });
  }

  return db
    .query(`DELETE FROM user_preferences WHERE user_id = $1`, [user_id])
    .then(() => {
      if (amenities.length === 0) {
        return []; // No amenities to insert
      }

      const valuesPlaceholders = amenities
        .map((_, i) => `($1, $${i + 2})`)
        .join(', ');

      const insertAmenities = `
        INSERT INTO user_preferences (user_id, amenity_id)
        VALUES ${valuesPlaceholders}
        RETURNING *;
      `;

      const queryParams = [user_id, ...amenities];

      return db.query(insertAmenities, queryParams);
    })
    .then(({ rows }) => {
      return rows;
    });
}

function deleteUser({ user_id }) {
  if (!user_id) {
    return Promise.reject({
      msg: 'User ID is missing',
      status: 400,
    });
  }

  return db
    .query(`DELETE FROM users WHERE id = $1`, [user_id])
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          msg: `User with ID "${user_id}" is not found`,
          status: 404,
        });
      }
      return { msg: 'User deleted successfully' };
    });
}

function selectUserFavouritesByUserId({ user_id }) {
  if (!user_id) {
    return Promise.reject({
      msg: 'User ID is missing',
      status: 400,
    });
  }
  const sql = `
    SELECT 
      cafes.id AS cafe_id,
      cafes.name,
      cafes.description,
      cafes.address,
      ST_AsText(cafes.location) AS location,
      cafes.busy_status,
      cafes.is_verified,
      cafes.created_at
    FROM user_favorites
    JOIN cafes ON user_favorites.cafe_id = cafes.id
    WHERE user_favorites.user_id = $1;
  `;
  const args = [user_id];
  return db.query(sql, args).then(({ rows }) => {
    return rows;
  });
}

function insertUserFavouriteCafeByUserId({ user_id }, { cafe_id }) {
  if (!user_id) {
    return Promise.reject({ msg: 'User ID is missing', status: 400 });
  }
  if (!cafe_id) {
    return Promise.reject({ msg: 'Cafe ID is missing', status: 400 });
  }

  return Promise.all([
    checkUserExists(user_id),
    checkCafeExists(cafe_id),
    checkCafeIsAlreadyInFavourites(user_id, cafe_id),
  ])
    .then(() =>
      db.query(
        `INSERT INTO user_favorites (user_id, cafe_id) 
         VALUES ($1, $2) RETURNING cafe_id`,
        [user_id, cafe_id]
      )
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 400,
          msg: `Failed to add cafe ${cafe_id} to favorites`,
        });
      }
      return db.query(
        `SELECT id AS cafe_id, name, description, address,
                ST_AsText(location) AS location, busy_status, is_verified, created_at
         FROM cafes WHERE id = $1`,
        [rows[0].cafe_id]
      );
    })
    .then(({ rows }) => rows[0]);
}

function deleteUserFavouriteCafe({ user_id }, { cafe_id }) {
  if (!user_id) {
    return Promise.reject({ msg: 'User ID is missing', status: 400 });
  }
  if (!cafe_id) {
    return Promise.reject({ msg: 'Cafe ID is missing', status: 400 });
  }

  return Promise.all([checkUserExists(user_id), checkCafeExists(cafe_id)])
    .then(() =>
      db.query(
        `DELETE FROM user_favorites WHERE user_id = $1 AND cafe_id = $2;`,
        [user_id, cafe_id]
      )
    )
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          msg: `Cafe with ID "${cafe_id}" is not in user's favorites`,
          status: 404,
        });
      }
      return { msg: 'Cafe removed from favorites successfully' };
    });
}

function selectUserReviewsByUserId({ user_id }) {
  if (!user_id) {
    return Promise.reject({
      msg: 'User ID is missing',
      status: 400,
    });
  }

  const sql = `
    SELECT 
      reviews.id AS review_id,
      reviews.cafe_id,
      cafes.name AS cafe_name,
      cafes.address AS cafe_address,
      reviews.rating,
      reviews.review_text,
      reviews.helpful_count,
      reviews.created_at,
      users.full_name AS reviewer_name  -- Add reviewer's name
    FROM reviews
    JOIN cafes ON reviews.cafe_id = cafes.id
    JOIN users ON reviews.user_id = users.id  -- Join with users table
    WHERE reviews.user_id = $1
    ORDER BY reviews.created_at DESC; -- Latest reviews first
  `;

  const args = [user_id];

  return db.query(sql, args).then(({ rows }) => {
    return rows;
  });
}

function selectUserReviewByReviewId({ user_id, review_id }) {
  if (!user_id) {
    return Promise.reject({ msg: 'User ID is missing', status: 400 });
  }
  if (!review_id) {
    return Promise.reject({ msg: 'Review ID is missing', status: 400 });
  }
  return checkUserExists(user_id).then(() => {
    const sql = `
    SELECT 
      reviews.id AS review_id,
      reviews.cafe_id,
      cafes.name AS cafe_name,
      cafes.address AS cafe_address,
      reviews.rating,
      reviews.review_text,
      reviews.helpful_count,
      reviews.created_at,
      users.full_name AS reviewer_name  -- Add reviewer's name
    FROM reviews
    JOIN cafes ON reviews.cafe_id = cafes.id
    JOIN users ON reviews.user_id = users.id  -- Join with users table
    WHERE reviews.user_id = $1 AND reviews.id = $2;
  `;

    const args = [user_id, review_id];

    return db.query(sql, args).then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          msg: `Review with ID "${review_id}" is not found`,
          status: 404,
        });
      }
      return rows[0];
    });
  });
}

function deleteUserReview({ user_id, review_id }) {
  if (!user_id) {
    return Promise.reject({ msg: 'User ID is missing', status: 400 });
  }
  if (!review_id) {
    return Promise.reject({ msg: 'Review ID is missing', status: 400 });
  }

  return checkUserExists(user_id)
    .then(() => {
      const sql = `DELETE FROM reviews WHERE user_id = $1 AND id = $2;`;
      return db.query(sql, [user_id, review_id]);
    })
    .then(({ rowCount }) => {
      if (rowCount === 0) {
        return Promise.reject({
          msg: `Review with ID "${review_id}" is not found`,
          status: 404,
        });
      }
      return;
    });
}

function selectUserByFirebaseUid({ firebase_uid }) {
  if (!firebase_uid) {
    return Promise.reject({ msg: 'Firebase UID is missing', status: 400 });
  }
  const sql = `SELECT * FROM users WHERE firebase_uid = $1`;
  const args = [firebase_uid];
  return db.query(sql, args).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({
        msg: `User with Firebase UID "${firebase_uid}" is not found`,
        status: 404,
      });
    }
    return rows[0];
  });
}

function selectUserAmenitiesByUserId({ user_id }) {
  if (!user_id) {
    return Promise.reject({
      msg: 'User ID is missing',
      status: 400,
    });
  }
  const sql = `
    SELECT amenities.name
    FROM amenities
    JOIN user_preferences ON amenities.id = user_preferences.amenity_id
    WHERE user_preferences.user_id = $1;
  `;
  const args = [user_id];
  return db.query(sql, args).then(({ rows }) => {
    return rows;
  });
}

module.exports = {
  selectUsers,
  insertUser,
  selectUserByUserId,
  updateUserByUserId,
  updateUserAmenitiesByUserId,
  deleteUser,
  selectUserFavouritesByUserId,
  insertUserFavouriteCafeByUserId,
  deleteUserFavouriteCafe,
  selectUserReviewsByUserId,
  selectUserReviewByReviewId,
  deleteUserReview,
  selectUserByFirebaseUid,
  selectUserAmenitiesByUserId,
};
