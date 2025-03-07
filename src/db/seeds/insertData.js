exports.insertData = (
  db,
  usersData,
  cafesData,
  cafeMediaData,
  amenitiesData,
  cafeAmenitiesData,
  userPreferencesData,
  reviewsData,
  reviewResponsesData,
  reviewVotesData,
  userFavoritesData,
  cafeVisitsData,
  cafeQrCodesData,
  reportsData,
  adminData
) => {
  // Insert USERS
  // Helper functions to insert arrays. We transform `location`
  // for users and cafes using ST_GeomFromGeoJSON.
  const insertUsers = async () => {
    try {
      for (const user of usersData) {
        const geoJson = user.location ? JSON.stringify(user.location) : null;

        await db.query(
          `
            INSERT INTO users
              (firebase_uid, email, full_name, avatar, role, location, points, badges, notification_preferences, fcm_token)
            VALUES
              ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6)::geography, $7, $8, $9, $10)
            RETURNING *;
                `,
          [
            user.firebase_uid,
            user.email,
            user.full_name,
            user.avatar,
            user.role,
            geoJson,
            user.points,
            user.badges,
            user.notification_preferences,
            user.fcm_token,
          ]
        );
      }
      return Promise.resolve();
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  };

  return insertUsers()
    .then(() => {
      // Insert CAFES
      const insertCafes = async () => {
        try {
          for (const cafe of cafesData) {
            const geoJson = cafe.location
              ? JSON.stringify(cafe.location)
              : null;

            await db.query(
              `
                INSERT INTO cafes
                  (owner_id, name, description, address, location, busy_status, is_verified)
                VALUES
                  ($1, $2, $3, $4, ST_GeomFromGeoJSON($5)::geography, $6, $7)
                RETURNING *;
              `,
              [
                cafe.owner_id,
                cafe.name,
                cafe.description,
                cafe.address,
                geoJson,
                cafe.busy_status,
                cafe.is_verified,
              ]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertCafes();
    })

    .then(() => {
      // Insert CAFE_MEDIA
      const inserCafeMedia = async () => {
        try {
          for (const media of cafeMediaData) {
            await db.query(
              `
              INSERT INTO cafe_media
                (cafe_id, media_url, media_type)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
              [media.cafe_id, media.media_url, media.media_type]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return inserCafeMedia();
    })

    .then(() => {
      // Insert AMENITIES
      const insertAmenities = async () => {
        try {
          for (const amenity of amenitiesData) {
            await db.query(
              `
              INSERT INTO amenities
                (name)
              VALUES
                ($1)
              RETURNING *;
            `,
              [amenity.name]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertAmenities();
    })

    .then(() => {
      // Insert CAFE_AMENITIES
      const insertCafeAmenities = async () => {
        try {
          for (const ca of cafeAmenitiesData) {
            await db.query(
              `
              INSERT INTO cafe_amenities
                (cafe_id, amenity_id)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
              [ca.cafe_id, ca.amenity_id]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertCafeAmenities();
    })

    .then(() => {
      // Insert USER_PREFERENCES
      const insertUserPrefs = async () => {
        try {
          for (const up of userPreferencesData) {
            await db.query(
              `
              INSERT INTO user_preferences
                (user_id, amenity_id)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
              [up.user_id, up.amenity_id]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertUserPrefs();
    })

    .then(() => {
      // Insert REVIEWS
      const insertReviews = async () => {
        try {
          for (const review of reviewsData) {
            await db.query(
              `
              INSERT INTO reviews
                (user_id, cafe_id, rating, review_text, helpful_count)
              VALUES
                ($1, $2, $3, $4, $5)
              RETURNING *;
            `,
              [
                review.user_id,
                review.cafe_id,
                review.rating,
                review.review_text,
                review.helpful_count,
              ]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertReviews();
    })

    .then(() => {
      // Insert REVIEW_RESPONSES
      const insertReviewRes = async () => {
        try {
          for (const resp of reviewResponsesData) {
            await db.query(
              `
              INSERT INTO review_responses
                (review_id, owner_id, response_text)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
              [resp.review_id, resp.owner_id, resp.response_text]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertReviewRes();
    })

    .then(() => {
      // Insert REVIEW_VOTES
      const insertReviewVotes = async () => {
        try {
          for (const vote of reviewVotesData) {
            await db.query(
              `
              INSERT INTO review_votes
                (user_id, review_id, vote_type)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
              [vote.user_id, vote.review_id, vote.vote_type]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertReviewVotes();
    })

    .then(() => {
      // Insert USER_FAVORITES
      const insertUserFavs = async () => {
        try {
          for (const fav of userFavoritesData) {
            await db.query(
              `
              INSERT INTO user_favorites
                (user_id, cafe_id)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
              [fav.user_id, fav.cafe_id]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertUserFavs();
    })

    .then(() => {
      // Insert CAFE_VISITS
      const insertCafeVisits = async () => {
        try {
          for (const visit of cafeVisitsData) {
            await db.query(
              `
              INSERT INTO cafe_visits
                (user_id, cafe_id, visited_at)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
              [visit.user_id, visit.cafe_id, visit.visited_at]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertCafeVisits();
    })

    .then(() => {
      // Insert CAFE_QR_CODES
      const insertCafeQrCodes = async () => {
        try {
          for (const qr of cafeQrCodesData) {
            await db.query(
              `
              INSERT INTO cafe_qr_codes
                (cafe_id, qr_code)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
              [qr.cafe_id, qr.qr_code]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertCafeQrCodes();
    })

    .then(() => {
      // Insert REPORTS
      const insertReports = async () => {
        try {
          for (const rep of reportsData) {
            await db.query(
              `
              INSERT INTO reports
                (reporter_id, cafe_id, reason, status)
              VALUES
                ($1, $2, $3, $4)
              RETURNING *;
            `,
              [rep.reporter_id, rep.cafe_id, rep.reason, rep.status]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertReports();
    })

    .then(() => {
      // Insert ADMINS
      const insertAdmins = async () => {
        try {
          for (const adm of adminData) {
            await db.query(
              `
              INSERT INTO admins
                (admin_id, can_remove_cafes, can_suspend_users, can_feature_cafes)
              VALUES
                ($1, $2, $3, $4)
              RETURNING *;
            `,
              [
                adm.admin_id,
                adm.can_remove_cafes,
                adm.can_suspend_users,
                adm.can_feature_cafes,
              ]
            );
          }
          return Promise.resolve();
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      };
      return insertAdmins();
    });
};
