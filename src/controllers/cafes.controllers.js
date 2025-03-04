const { getCafes } = require('../models/cafes.models');

function getCafes(req, res, next) {
  return fetchCafes()
    .then((cafes) => {
      response.status(200).send({ cafes });
    })
    .catch(next);
}

module.exports = {
  getCafes
};
