const { param } = require("../app");
const {
  selectReviewsByCafeId,
  selectReviewsById,
  selectVotesByReviewId,
} = require("../models/reviews.model");
const getReviewsByCafeId = (req, res, next) => {
  selectReviewsByCafeId(req.params)
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

module.exports = {
  getReviewsByCafeId,
  getReviewsById,
  getVoteByReviewId,
};
