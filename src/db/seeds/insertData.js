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
  const insertUsers = () => {
    const userPromises = usersData.map((user) => {
      const geoJson = user.location ? JSON.stringify(user.location) : null;

      return db.query(
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
    });
    return Promise.all(userPromises);
  };

  return insertUsers()
    .then(() => {
      // Insert CAFES
      const insertCafes = () => {
        const cafePromises = cafesData.map((cafe) => {
          const geoJson = cafe.location ? JSON.stringify(cafe.location) : null;

          return db.query(
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
        });
        return Promise.all(cafePromises);
      };

      return insertCafes();
    })

    .then(() => {
      // Insert CAFE_MEDIA
      const cafeMediaPromises = cafeMediaData.map((media) => {
        return db.query(
          `
              INSERT INTO cafe_media
                (cafe_id, media_url, media_type)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
          [media.cafe_id, media.media_url, media.media_type]
        );
      });
      return Promise.all(cafeMediaPromises);
    })

    .then(() => {
      // Insert AMENITIES
      const amenityPromises = amenitiesData.map((amenity) => {
        return db.query(
          `
              INSERT INTO amenities
                (name)
              VALUES
                ($1)
              RETURNING *;
            `,
          [amenity.name]
        );
      });
      return Promise.all(amenityPromises);
    })

    .then(() => {
      // Insert CAFE_AMENITIES
      const cafeAmsPromises = cafeAmenitiesData.map((ca) => {
        return db.query(
          `
              INSERT INTO cafe_amenities
                (cafe_id, amenity_id)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
          [ca.cafe_id, ca.amenity_id]
        );
      });
      return Promise.all(cafeAmsPromises);
    })

    .then(() => {
      // Insert USER_PREFERENCES
      const userPrefsPromises = userPreferencesData.map((up) => {
        return db.query(
          `
              INSERT INTO user_preferences
                (user_id, amenity_id)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
          [up.user_id, up.amenity_id]
        );
      });
      return Promise.all(userPrefsPromises);
    })

    .then(() => {
      // Insert REVIEWS
      const reviewsPromises = reviewsData.map((review) => {
        return db.query(
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
      });
      return Promise.all(reviewsPromises);
    })

    .then(() => {
      // Insert REVIEW_RESPONSES
      const reviewResPromises = reviewResponsesData.map((resp) => {
        return db.query(
          `
              INSERT INTO review_responses
                (review_id, owner_id, response_text)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
          [resp.review_id, resp.owner_id, resp.response_text]
        );
      });
      return Promise.all(reviewResPromises);
    })

    .then(() => {
      // Insert REVIEW_VOTES
      const reviewVotesPromises = reviewVotesData.map((vote) => {
        return db.query(
          `
              INSERT INTO review_votes
                (user_id, review_id, vote_type)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
          [vote.user_id, vote.review_id, vote.vote_type]
        );
      });
      return Promise.all(reviewVotesPromises);
    })

    .then(() => {
      // Insert USER_FAVORITES
      const userFavPromises = userFavoritesData.map((fav) => {
        return db.query(
          `
              INSERT INTO user_favorites
                (user_id, cafe_id)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
          [fav.user_id, fav.cafe_id]
        );
      });
      return Promise.all(userFavPromises);
    })

    .then(() => {
      // Insert CAFE_VISITS
      const cafeVisitsPromises = cafeVisitsData.map((visit) => {
        return db.query(
          `
              INSERT INTO cafe_visits
                (user_id, cafe_id, visited_at)
              VALUES
                ($1, $2, $3)
              RETURNING *;
            `,
          [visit.user_id, visit.cafe_id, visit.visited_at]
        );
      });
      return Promise.all(cafeVisitsPromises);
    })

    .then(() => {
      // Insert CAFE_QR_CODES
      const cafeQrPromises = cafeQrCodesData.map((qr) => {
        return db.query(
          `
              INSERT INTO cafe_qr_codes
                (cafe_id, qr_code)
              VALUES
                ($1, $2)
              RETURNING *;
            `,
          [qr.cafe_id, qr.qr_code]
        );
      });
      return Promise.all(cafeQrPromises);
    })

    .then(() => {
      // Insert REPORTS
      const reportsPromises = reportsData.map((rep) => {
        return db.query(
          `
              INSERT INTO reports
                (reporter_id, cafe_id, reason, status)
              VALUES
                ($1, $2, $3, $4)
              RETURNING *;
            `,
          [rep.reporter_id, rep.cafe_id, rep.reason, rep.status]
        );
      });
      return Promise.all(reportsPromises);
    })

    .then(() => {
      // Insert ADMINS
      const adminsPromises = adminData.map((adm) => {
        return db.query(
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
      });
      return Promise.all(adminsPromises);
    });
};
