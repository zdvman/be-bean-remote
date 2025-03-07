const { param } = require("../app");
const {
  selectReviewsByCafeId,
  selectReviewsById,
  selectVotesByReviewId,
  insertReview,
  removeReview
} = require("../models/reviews.model");
const { checkCafeExists } = require('../db/seeds/utils.js');

const getReviewsByCafeId = (req, res, next) => {
  const { id } = req.params;
  return checkCafeExists( id )
    .then(() => {
      return selectReviewsByCafeId(req.params)
    })
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviewsById = (req, res, next) => {
  selectReviewsById(req.params)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

const getVoteByReviewId = (req, res, next) => {
  selectVotesByReviewId(req.params)
    .then((votes) => {
      res.status(200).send({ votes });
    })
    .catch((err) => {
      next(err);
    });
};

const addReview = (req, res, next) => {
  const newReview = req.body;
  const { id } = req.params;
  return insertReview(newReview, id)
  .then((review) => {
      res.status(201).send({ review });
  })
  .catch((err) => {
      next(err);
  })
}

const deleteReview = (req, res, next) => {
  const { cafe_id, review_id } = req.params;
  return removeReview(review_id)
  .then(() => {
      res.status(204).send({
        "msg": `Review with ID ${review_id} for cafe ${cafe_id} has been deleted.`
      });
  })
  .catch((err) => {
      next(err);
  })
}

module.exports = {
  getReviewsByCafeId,
  getReviewsById,
  getVoteByReviewId,
  addReview,
  deleteReview
};
