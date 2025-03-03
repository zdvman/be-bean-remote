// const format = require('pg-format');
// const { convertTimestampToDate, createRef } = require('./utils');
const db = require('../connection');

const seed = ({ userData }) => {
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

      // 3) Optionally insert seed data after table creation
      .then(() => {
        console.log('All tables created successfully!');
      })
      .catch((err) => {
        console.error(err);
      })
  );
};

module.exports = seed;
