// src/routes/users-router.js
const express = require('express');
const reviewsRouter = express.Router();
const {
  getReviewByReviewId,
  getVoteCount,
  getCurrentVoteType,
  voteController,
  deleteReview,
} = require('../controllers/reviews.controllers');
const {
  authMiddleware,
  restrictTo,
  allowToUserOrAdmin,
  allowToReviewOwnerOrAdmin,
} = require('../middleware/auth'); // Import both middleware

reviewsRouter
  .route('/:review_id')
  .get(getReviewByReviewId)
  .delete(authMiddleware, allowToReviewOwnerOrAdmin, deleteReview);

// Handling votes on reviews
// Voting Endpoints: Use POST /api/reviews/:review_id/helpful_vote and POST /api/reviews/:review_id/unhelpful_vote for creating, updating, or deleting votes. This allows users to click thumb up or thumb down, toggling their vote state:
// If no vote exists, it creates one (e.g., clicking thumb up sets "helpful").
// If the vote matches the button (e.g., already "helpful" and click thumb up), it deletes the vote.
// If the vote is the opposite (e.g., "unhelpful" and click thumb up), it updates to "helpful".

// =======

// When a user clicks the same button again (e.g., clicks "helpful" when they already voted "helpful"), the POST endpoint checks the current vote and deletes it if it matches, rather than creating a new one. This is handled server-side without switching methods, simplifying client logic. For example:

// If a user has a "helpful" vote and clicks the thumb up button again, the endpoint deletes the vote, unhighlighting the button.
// This is achieved by checking the database state within the POST handler, not by switching to a DELETE method.

// Vote Count Endpoints: Use GET /api/reviews/:review_id/votes?type=helpful to get the count of "helpful" votes
// GET /api/reviews/:review_id/votes?type=unhelpful for "unhelpful" votes, displaying these numbers on the respective buttons.
reviewsRouter.route('/:review_id/votes').get(getVoteCount);

// User's Current Vote: Include GET /api/reviews/:review_id/vote to check the user's current vote type,
// aiding UI state management (e.g., highlighting buttons).
reviewsRouter
  .route('/:review_id/vote')
  .get(authMiddleware, getCurrentVoteType)
  // Query Parameter (e.g., POST /:review_id/vote?type=helpful)
  .post(authMiddleware, voteController);

module.exports = reviewsRouter;
