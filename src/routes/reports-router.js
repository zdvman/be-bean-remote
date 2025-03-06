// src/routes/amenities-router.js
const express = require('express');
const reportsRouter = express.Router();
const {
  getReports,
  postReport,
  getReportByReportId,
  patchReportByReportId,
  deleteReportByReportId,
} = require('../controllers/reports.controllers');
const {
  authMiddleware,
  restrictTo,
  allowToUserOrAdmin,
} = require('../middleware/auth'); // Import both middleware

// Protected route: Get (requires authentication, restrict to admins only)
reportsRouter
  .route('/')
  .get(authMiddleware, restrictTo('admin'), getReports)
  // Protected route: Post a report (requires authentication)
  .post(authMiddleware, postReport);

// Protected route: Get, patch, or delete an amenity by amenity_id (requires authentication, restrict to admins only)
reportsRouter
  .route('/:id')
  .get(authMiddleware, restrictTo('admin'), getReportByReportId)
  .patch(authMiddleware, restrictTo('admin'), patchReportByReportId)
  .delete(authMiddleware, restrictTo('admin'), deleteReportByReportId);

module.exports = reportsRouter;
