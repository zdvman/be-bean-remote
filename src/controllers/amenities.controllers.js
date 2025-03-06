const {
  selectAmenities,
  insertAmenity,
  selectAmenityByAmenityId,
  updateAmenityByAmenityId,
  removeAmenityByAmenityId,
} = require('../models/amenities.models');

function getAmenities(req, res, next) {
  return selectAmenities()
    .then((amenities) => {
      res.status(200).send({ amenities });
    })
    .catch(next);
}

function postAmenities(req, res, next) {
  return insertAmenity(req?.body)
    .then((amenity) => {
      res.status(201).send({ amenity });
    })
    .catch(next);
}

function getAmenityByAmenityId(req, res, next) {
  return selectAmenityByAmenityId(req?.params)
    .then((amenity) => {
      res.status(200).send({ amenity });
    })
    .catch(next);
}

function patchAmenityByAmenityId(req, res, next) {
  return updateAmenityByAmenityId(req?.params, req?.body)
    .then((amenity) => {
      res.status(200).send({ amenity });
    })
    .catch(next);
}

function deleteAmenityByAmenityId(req, res, next) {
  return removeAmenityByAmenityId(req?.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
}

module.exports = {
  getAmenities,
  postAmenities,
  getAmenityByAmenityId,
  patchAmenityByAmenityId,
  deleteAmenityByAmenityId,
};
