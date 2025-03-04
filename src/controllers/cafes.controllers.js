const { selectCafes } = require('../models/cafes.models');

function getCafes(req, res, next) {
  return selectCafes()
    .then((cafes) => {
      res.status(200).send({ cafes });
    })
    .catch(next);
}

module.exports = {
  getCafes
};
