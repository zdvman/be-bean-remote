const {
  selectCafes,
  selectCafeByCafeId,
  selectCafesByAmenity,
  selectAmenitiesByCafeId,
  insertCafe,
  selectCafesByCoordinates,
  selectCafesByRadius,
} = require('../models/cafes.models');

function getCafes(req, res, next) {
  return selectCafes()
    .then((cafes) => {
      res.status(200).send({ cafes });
    })
    .catch(next);
}

function getCafeByCafeId(req, res, next) {
  return selectCafeByCafeId(req?.params)
    .then((cafe) => {
      res.status(200).send({ cafe });
    })
    .catch(next);
}

function getCafesByAmenity(req, res, next) {
  return selectCafesByAmenity(req?.query)
    .then((cafes) => {
      res.status(200).json({ cafes });
    })
    .catch(next);
}

function getAmenitiesByCafeId(req, res, next) {
  return selectAmenitiesByCafeId(req?.params)
    .then((amenities) => {
      res.status(200).send({ amenities });
    })
    .catch(next);
}

function postCafe(req, res, next) {
  return insertCafe(req?.body, req?.user?.dbUser)
    .then((cafes) => {
      res.status(201).send({ cafes });
    })
    .catch(next);
}

function getCafesByCoordinates(req, res, next) {
  return selectCafesByCoordinates(req?.query)
    .then((cafes) => {
      res.status(200).send({ cafes });
    })
    .catch(next);
}

function getCafesByRadius(req, res, next) {
  return selectCafesByRadius(req?.query)
    .then((cafes) => {
      res.status(200).send({ cafes });
    })
    .catch(next);
}

module.exports = {
  getCafes,
  getCafeByCafeId,
  getCafesByAmenity,
  getAmenitiesByCafeId,
  postCafe,
  getCafesByCoordinates,
  getCafesByRadius,
};
