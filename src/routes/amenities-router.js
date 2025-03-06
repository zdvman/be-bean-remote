// src/routes/amenities-router.js
const express = require('express');
const amenitiesRouter = express.Router();
const {
  getAmenities,
  postAmenities,
  getAmenityByAmenityId,
  patchAmenityByAmenityId,
  deleteAmenityByAmenityId,
} = require('../controllers/amenities.controllers');
const {
  authMiddleware,
  restrictTo,
  allowToUserOrAdmin,
} = require('../middleware/auth'); // Import both middleware

// Protected route: Get and post amenities (requires authentication, restrict to admins only)
amenitiesRouter
  .route('/')
  .get(getAmenities)
  .post(authMiddleware, restrictTo('admin'), postAmenities);

// Protected route: Get, patch, or delete an amenity by amenity_id (requires authentication, restrict to admins only)
amenitiesRouter
  .route('/:id')
  .get(authMiddleware, restrictTo('admin'), getAmenityByAmenityId)
  .patch(authMiddleware, restrictTo('admin'), patchAmenityByAmenityId)
  .delete(authMiddleware, restrictTo('admin'), deleteAmenityByAmenityId);

module.exports = amenitiesRouter;
