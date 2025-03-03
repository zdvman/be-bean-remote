const dataType =
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'production'
    ? 'development'
    : 'test';
const data = require(`../data/${dataType}-data/index.js`);
const seed = require('./seed.js');
const db = require('../connection.js');

const runSeed = () => {
  return seed(data).then(() => db.end());
};

runSeed();
