const { selectReviewsByCafeId } = require("../models/reviews.model");
const getReviewsByCafeId = (req, res, next) => {
  selectReviewsByCafeId(req.params)
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getReviewsByCafeId,
};
