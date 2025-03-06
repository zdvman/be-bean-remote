exports.dropTables = (db) => {
  return db
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
    .then(() => db.query(`DROP TABLE IF EXISTS users;`));
};
