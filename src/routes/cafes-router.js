// src/routes/users-router.js
const express = require('express');
const cafesRouter = express.Router();
const {
  getCafes,
  getCafeByID,
  getCafesByAmenity,
  getAmenitiesByCafeId,
  postCafe,
  getCafesByCoordinates,
  getCafesByRadius,
} = require('../controllers/cafes.controllers');
const {
  getReviewsByCafeId,
  addReview,
  deleteReview
} = require("../controllers/reviews.controllers");
const { authMiddleware, restrictTo } = require('../middleware/auth'); // Import both middleware

cafesRouter.route('/').get((req, res, next) => {
  if (req.query.amenity) {
    getCafesByAmenity(req, res, next);
  } else {
    getCafes(req, res, next);
  }
});
cafesRouter.route('/').post(postCafe);
cafesRouter.route('/:id').get(getCafeByID);
cafesRouter.route('/:id/amenities').get(getAmenitiesByCafeId);
cafesRouter.route('/map/visible').get(getCafesByCoordinates);
cafesRouter.route('/map/radius').get(getCafesByRadius);
cafesRouter.route("/:id/reviews").get(getReviewsByCafeId);
cafesRouter.route("/:id/reviews").post(addReview);
cafesRouter.route("/:cafe_id/reviews/:review_id").delete(deleteReview);

module.exports = cafesRouter;
