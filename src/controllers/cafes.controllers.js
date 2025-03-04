const { selectCafes, selectCafeByID } = require('../models/cafes.models');

function getCafes(req, res, next) {
  return selectCafes()
    .then((cafes) => {
      res.status(200).send({ cafes });
    })
    .catch(next);
}

function getCafeByID(req, res, next) {
    const { id } = req.params;
    return selectCafeByID(id)
    .then((cafe) => {
      res.status(200).send({ cafe });
    })
    .catch(next);
}

module.exports = {
  getCafes,
  getCafeByID
};
