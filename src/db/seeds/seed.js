// const format = require('pg-format');
// const { convertTimestampToDate, createRef } = require('./utils');
const db = require('../connection');
const { createTables } = require('./createTables');
const { dropTables } = require('./dropTables');
const { insertData } = require('./insertData');

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
    // Drop tables in the correct order
    dropTables(db)
      // Create tables in the correct order
      .then(() => {
        return createTables(db);
      })
      // Insert data into tables in the correct order
      .then(() => {
        return insertData(
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
        );
      })
      .then(() => {
        console.log('All tables created and seeded successfully!');
      })
      // Catch any errors and log them to the console
      .catch((err) => {
        console.error(err);
      })
  );
};

module.exports = seed;
