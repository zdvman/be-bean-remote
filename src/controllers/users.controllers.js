const {
  selectUsers,
  insertUser,
  selectUserByUserId,
  updateUserByUserId,
  updateUserAmenitiesByUserId,
  deleteUser,
  selectUserFavouritesByUserId,
  insertUserFavouriteCafeByUserId,
  deleteUserFavouriteCafe,
  selectUserReviewsByUserId,
  selectUserReviewByReviewId,
  deleteUserReview,
  selectUserByFirebaseUid,
  selectUserAmenitiesByUserId,
} = require('../models/users.models');

function getUsers(request, response, next) {
  return selectUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch(next);
}

function postUser(request, response, next) {
  return insertUser(request?.body)
    .then((user) => {
      response.status(201).send({ user });
    })
    .catch(next);
}

function getUserByUserId(request, response, next) {
  return selectUserByUserId(request?.params)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch(next);
}

function patchUserByUserId(request, response, next) {
  return updateUserByUserId(request?.params, request?.body)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch(next);
}

function patchUserAmenitiesByUserId(request, response, next) {
  return updateUserAmenitiesByUserId(request?.params, request?.body)
    .then((userAmenities) => {
      response.status(200).send({ userAmenities });
    })
    .catch(next);
}

function deleteUserByUserId(request, response, next) {
  return deleteUser(request?.params)
    .then((msg) => {
      response.status(200).send(msg);
    })
    .catch(next);
}

function getUserFavouritesByUserId(request, response, next) {
  return selectUserFavouritesByUserId(request?.params)
    .then((favourites) => {
      response.status(200).send({ favourites });
    })
    .catch(next);
}

function postUserFavouriteCafeByUserId(request, response, next) {
  return insertUserFavouriteCafeByUserId(request?.params, request?.body)
    .then((favourite) => {
      response.status(201).send({ favourite });
    })
    .catch(next);
}

function deleteUserFavouriteCafeByCafeId(request, response, next) {
  return deleteUserFavouriteCafe(request?.params)
    .then((msg) => {
      response.status(200).send(msg);
    })
    .catch(next);
}

function getUserReviewsByUserId(request, response, next) {
  return selectUserReviewsByUserId(request?.params)
    .then((reviews) => {
      response.status(200).send({ reviews });
    })
    .catch(next);
}

function getUserReviewByReviewId(request, response, next) {
  return selectUserReviewByReviewId(request?.params)
    .then((review) => {
      response.status(200).send({ review });
    })
    .catch(next);
}

function deleteUserReviewByReviewId(request, response, next) {
  return deleteUserReview(request?.params)
    .then(() => {
      response.status(204).send();
    })
    .catch(next);
}

function getUserByFirebaseUid(request, response, next) {
  return selectUserByFirebaseUid(request?.query)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch(next);
}

function getUserAmenitiesByUserId(request, response, next) {
  return selectUserAmenitiesByUserId(request?.params)
    .then((userAmenities) => {
      response.status(200).send({ userAmenities });
    })
    .catch(next);
}

module.exports = {
  getUsers,
  postUser,
  getUserByUserId,
  patchUserByUserId,
  patchUserAmenitiesByUserId,
  deleteUserByUserId,
  getUserFavouritesByUserId,
  postUserFavouriteCafeByUserId,
  deleteUserFavouriteCafeByCafeId,
  getUserReviewsByUserId,
  getUserReviewByReviewId,
  deleteUserReviewByReviewId,
  getUserByFirebaseUid,
  getUserAmenitiesByUserId,
};
