// src/routes/users-router.js
const express = require("express");
const reviewsRouter = express.Router();
const {
  getReviewsByCafeId,
  getReviewsById,
} = require("../controllers/reviews.controllers");
const { authMiddleware, restrictTo } = require("../middleware/auth"); // Import both middleware

// Protected route: Get all users (requires authentication, optionally restrict to admins)
reviewsRouter.route("/:cafe_id").get(getReviewsByCafeId);
reviewsRouter.route("/:id").get(getReviewsById);

module.exports = reviewsRouter;
