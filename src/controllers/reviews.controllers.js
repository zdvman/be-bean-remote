const {
  selectReviewsByCafeId,
  selectReviewByReviewId,
  selectVotesByReviewId,
  insertReview,
  removeReview,
  handleVote,
  countVotesByType,
  selectReviewVoteByUserOnReview,
} = require('../models/reviews.model');

const getReviewsByCafeId = (req, res, next) => {
  return selectReviewsByCafeId(req?.params)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch(next);
};

const getReviewByReviewId = (req, res, next) => {
  selectReviewByReviewId(req?.params)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch(next);
};

const getVotesByReviewId = (req, res, next) => {
  selectVotesByReviewId(req?.params)
    .then((votes) => {
      res.status(200).send({ votes });
    })
    .catch(next);
};

const addReview = (req, res, next) => {
  return insertReview(req?.params, req?.body, req?.user?.dbUser)
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch(next);
};

const deleteReview = (req, res, next) => {
  return removeReview(req?.params)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

// Handling votes on reviews

function voteController(req, res, next) {
  return handleVote(req?.params, req?.user?.dbUser, req?.query)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch(next);
}

function getVoteCount(req, res, next) {
  return countVotesByType(req?.params, req?.query)
    .then((count) => {
      res.status(200).send({ count });
    })
    .catch(next);
}

function getCurrentVoteType(req, res, next) {
  return selectReviewVoteByUserOnReview(req?.user?.dbUser, req?.params)
    .then((vote_type) => {
      res.status(200).send({ vote_type });
    })
    .catch(next);
}

module.exports = {
  getReviewsByCafeId,
  getReviewByReviewId,
  getVotesByReviewId,
  addReview,
  deleteReview,
  getVoteCount,
  getCurrentVoteType,
  voteController,
};
