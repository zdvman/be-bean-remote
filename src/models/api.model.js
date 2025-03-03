function fetchApi() {
  return new Promise((resolve, reject) => {
    try {
      const endpoints = require('./../../endpoints.json');
      if (endpoints) {
        resolve(endpoints);
      } else {
        reject({ msg: 'No endpoints available', status: 500 });
      }
    } catch (err) {
      reject({ msg: 'Failed to load endpoints', status: 500 });
    }
  });
}

module.exports = { fetchApi };
