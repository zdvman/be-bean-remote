// src/routes/users-router.js
const express = require('express');
const cafesRouter = express.Router();
const {
  getCafes,
  getCafeByCafeId,
  getCafesByAmenity,
  getAmenitiesByCafeId,
  postCafe,
  getCafesByCoordinates,
  getCafesByRadius,
} = require('../controllers/cafes.controllers');
const {
  getReviewsByCafeId,
  addReview,
} = require('../controllers/reviews.controllers');
const {
  authMiddleware,
  restrictTo,
  allowToUserOrAdmin,
} = require('../middleware/auth'); // Import both middleware

cafesRouter.route('/').get((req, res, next) => {
  if (req.query.amenity) {
    getCafesByAmenity(req, res, next);
  } else {
    getCafes(req, res, next);
  }
});
cafesRouter.route('/').post(authMiddleware, postCafe);
cafesRouter.route('/:cafe_id').get(getCafeByCafeId);
cafesRouter.route('/:cafe_id/amenities').get(getAmenitiesByCafeId);
cafesRouter.route('/map/visible').get(getCafesByCoordinates);
cafesRouter.route('/map/radius').get(getCafesByRadius);
cafesRouter.route('/:cafe_id/reviews').get(getReviewsByCafeId);
cafesRouter.route('/:cafe_id/reviews').post(authMiddleware, addReview);

module.exports = cafesRouter;
