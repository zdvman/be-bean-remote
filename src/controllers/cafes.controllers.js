const {
  selectCafes,
  selectCafeByID,
  selectCafesByAmenity,
  selectAmenitiesByCafeId,
  selectPostCafe,
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

function getCafeByID(req, res, next) {
  const { id } = req.params;
  return selectCafeByID(id)
    .then((cafe) => {
      res.status(200).send({ cafe });
    })
    .catch(next);
}

function getCafesByAmenity(req, res, next) {
  const amenity = req.query.amenity;
  return selectCafesByAmenity(amenity)
    .then((cafes) => {
      if (cafes.length === 0) {
        return res.status(404).send({ msg: 'No cafes with this amenity' });
      }
      res.status(200).json({ cafes });
    })
    .catch(next);
}

function getAmenitiesByCafeId(req, res, next) {
  const { id } = req.params;
  selectCafeByID(id)
    .then(() => {
      return selectAmenitiesByCafeId(id);
    })
    .then((amenities) => {
      const cafe_id = id;
      res.status(200).send({ cafe_id, amenities });
    })
    .catch(next);
}

function postCafe(req, res, next) {
  const {
    owner_id,
    name,
    description,
    address,
    location,
    busy_status,
    is_verified,
  } = req.body;
  return selectPostCafe(
    owner_id,
    name,
    description,
    address,
    location,
    busy_status,
    is_verified
  )
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
  getCafeByID,
  getCafesByAmenity,
  getAmenitiesByCafeId,
  postCafe,
  getCafesByCoordinates,
  getCafesByRadius,
};