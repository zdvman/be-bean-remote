// const format = require('pg-format');
// const { convertTimestampToDate, createRef } = require('./utils');
const db = require('../connection');

const seed = ({
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
  adminData,
}) => {
  return (
    db
      // 1) DROP TABLES (in reverse dependency order)
      .query(`DROP TABLE IF EXISTS admins;`)
      .then(() => db.query(`DROP TABLE IF EXISTS reports;`))
      .then(() => db.query(`DROP TABLE IF EXISTS cafe_qr_codes;`))
      .then(() => db.query(`DROP TABLE IF EXISTS cafe_visits;`))
      .then(() => db.query(`DROP TABLE IF EXISTS user_favorites;`))
      .then(() => db.query(`DROP TABLE IF EXISTS review_votes;`))
      .then(() => db.query(`DROP TABLE IF EXISTS review_responses;`))
      .then(() => db.query(`DROP TABLE IF EXISTS reviews;`))
      .then(() => db.query(`DROP TABLE IF EXISTS user_preferences;`))
      .then(() => db.query(`DROP TABLE IF EXISTS cafe_amenities;`))
      .then(() => db.query(`DROP TABLE IF EXISTS amenities;`))
      .then(() => db.query(`DROP TABLE IF EXISTS cafe_media;`))
      .then(() => db.query(`DROP TABLE IF EXISTS cafes;`))
      .then(() => db.query(`DROP TABLE IF EXISTS users;`))

      // 2) CREATE TABLES (in forward dependency order)
      // ---- USERS ----
      .then(() => {
        return db.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            firebase_uid VARCHAR(255) UNIQUE NOT NULL, -- Links to Firebase Auth UID
            email VARCHAR(255) UNIQUE NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            avatar TEXT DEFAULT 'https://avatars.githubusercontent.com/u/17879520?v=4',
            role VARCHAR(50) CHECK (role IN ('user', 'business', 'admin')) DEFAULT 'user',
            location GEOGRAPHY(Point, 4326), -- optional for last known location
            points INT DEFAULT 0, -- Engagement points
            badges TEXT[] DEFAULT '{}', -- Earned badges
            notification_preferences JSONB DEFAULT '{}', -- Notification settings
            fcm_token TEXT, -- Firebase Cloud Messaging token for push notifications
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
      })

      // ---- CAFES ----
      .then(() => {
        return db.query(`
          CREATE TABLE cafes (
            id SERIAL PRIMARY KEY,
            owner_id INT REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            address TEXT NOT NULL,
            location GEOGRAPHY(Point, 4326), -- GPS coordinates
            -- Owner can update how busy (occupancy) the cafe is
            busy_status VARCHAR(20) CHECK (busy_status IN ('quiet', 'moderate', 'busy')) DEFAULT 'quiet',
            is_verified BOOLEAN DEFAULT FALSE, -- Admin verification
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
      })

      // ---- CAFE_MEDIA ----
      .then(() => {
        return db.query(`
          CREATE TABLE cafe_media (
            id SERIAL PRIMARY KEY,
            cafe_id INT REFERENCES cafes(id) ON DELETE CASCADE,
            media_url TEXT NOT NULL,
            media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
      })

      // ---- AMENITIES ----
      .then(() => {
        return db.query(`
          CREATE TABLE amenities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
          );
        `);
      })

      // ---- CAFE_AMENITIES ----
      .then(() => {
        return db.query(`
          CREATE TABLE cafe_amenities (
            cafe_id INT REFERENCES cafes(id) ON DELETE CASCADE,
            amenity_id INT REFERENCES amenities(id) ON DELETE CASCADE,
            PRIMARY KEY (cafe_id, amenity_id)
          );
        `);
      })

      // ---- USER_PREFERENCES ----
      .then(() => {
        return db.query(`
          CREATE TABLE user_preferences (
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            amenity_id INT REFERENCES amenities(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, amenity_id)
          );
        `);
      })

      // ---- REVIEWS ----
      .then(() => {
        return db.query(`
          CREATE TABLE reviews (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            cafe_id INT REFERENCES cafes(id) ON DELETE CASCADE,
            rating INT CHECK (rating BETWEEN 1 AND 5),
            review_text TEXT,
            helpful_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
      })

      // ---- REVIEW_RESPONSES (owner replies to a review) ----
      .then(() => {
        return db.query(`
          CREATE TABLE review_responses (
            id SERIAL PRIMARY KEY,
            review_id INT REFERENCES reviews(id) ON DELETE CASCADE,
            owner_id INT REFERENCES users(id) ON DELETE CASCADE,
            response_text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
      })

      // ---- REVIEW_VOTES ----
      .then(() => {
        return db.query(`
          CREATE TABLE review_votes (
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            review_id INT REFERENCES reviews(id) ON DELETE CASCADE,
            vote_type VARCHAR(10) CHECK (vote_type IN ('helpful', 'unhelpful')),
            PRIMARY KEY (user_id, review_id)
          );
        `);
      })

      // ---- USER_FAVORITES ----
      .then(() => {
        return db.query(`
          CREATE TABLE user_favorites (
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            cafe_id INT REFERENCES cafes(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, cafe_id)
          );
        `);
      })

      // ---- CAFE_VISITS ----
      .then(() => {
        return db.query(`
          CREATE TABLE cafe_visits (
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            cafe_id INT REFERENCES cafes(id) ON DELETE CASCADE,
            visited_at TIMESTAMP DEFAULT NOW(),
            -- You could store scanned_qr BOOLEAN or scanned_at TIMESTAMP
            -- to confirm a user truly scanned the code on-site
            PRIMARY KEY (user_id, cafe_id)
          );
        `);
      })

      // ---- CAFE_QR_CODES ----
      .then(() => {
        return db.query(`
          CREATE TABLE cafe_qr_codes (
            cafe_id INT PRIMARY KEY REFERENCES cafes(id) ON DELETE CASCADE,
            qr_code TEXT UNIQUE NOT NULL
          );
        `);
      })

      // ---- REPORTS (Admin moderation) ----
      .then(() => {
        return db.query(`
          CREATE TABLE reports (
            id SERIAL PRIMARY KEY,
            reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
            cafe_id INT REFERENCES cafes(id) ON DELETE CASCADE,
            reason TEXT NOT NULL,
            status VARCHAR(50) CHECK (status IN ('pending', 'resolved', 'dismissed')) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
      })

      // ---- ADMINS ----
      .then(() => {
        return db.query(`
          CREATE TABLE admins (
            admin_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            can_remove_cafes BOOLEAN DEFAULT TRUE,
            can_suspend_users BOOLEAN DEFAULT TRUE,
            can_feature_cafes BOOLEAN DEFAULT TRUE
          );
        `);
      })
      // --- 3) Insert data in the correct order ---
      //
      // Helper functions to insert arrays. We transform `location`
      // for users and cafes using ST_GeomFromGeoJSON.

      .then(() => {
        // Insert USERS
        const insertUsers = () => {
          const userPromises = usersData.map((user) => {
            const geoJson = user.location
              ? JSON.stringify(user.location)
              : null;

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

        return insertUsers();
      })

      .then(() => {
        // Insert CAFES
        const insertCafes = () => {
          const cafePromises = cafesData.map((cafe) => {
            const geoJson = cafe.location
              ? JSON.stringify(cafe.location)
              : null;

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
      })

      .then(() => {
        console.log('All tables created and seeded successfully!');
      })
      .catch((err) => {
        console.error(err);
      })
  );
};

module.exports = seed;
