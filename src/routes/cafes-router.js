// src/routes/users-router.js
const express = require('express');
const cafesRouter = express.Router();
const {
  getCafes,
  getCafeByID,
  getCafesByAmenity,
  getAmenitiesByCafeId
} = require('../controllers/cafes.controllers');
const { authMiddleware, restrictTo } = require('../middleware/auth'); // Import both middleware

cafesRouter.route('/').get((req, res, next) => {
    if(req.query.amenity) {
        getCafesByAmenity(req, res, next);
    }
    else{
        getCafes(req, res, next);
    }
});
cafesRouter.route('/:id').get(getCafeByID);
cafesRouter.route('/:id/amenities').get(getAmenitiesByCafeId);

module.exports = cafesRouter;
