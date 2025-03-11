// src/routes/users-router.js
const express = require('express');
const usersRouter = express.Router();
const {
  getUsers,
  patchUserByUserId,
  postUser,
  getUserByUserId,
  patchUserAmenitiersByUserId,
  deleteUserByUserId,
  deleteUserFavouriteCafeByCafeId,
  postUserFavouriteCafeByUserId,
  getUserFavouritesByUserId,
  getUserReviewsByUserId,
  getUserReviewByReviewId,
  deleteUserReviewByReviewId,
  getUserByFirebaseUid,
} = require('../controllers/users.controllers');
const {
  authMiddleware,
  restrictTo,
  allowToUserOrAdmin,
} = require('../middleware/auth'); // Import both middleware

// Protected route: Get all users (requires authentication, restrict to admins only)
usersRouter
  .route('/')
  .get(authMiddleware, restrictTo('admin'), getUsers)
  .post(authMiddleware, postUser);

// Protected route: Get user by user ID (requires authentication, resticts to user (tyhe owner of profile) or admin)
usersRouter
  .route('/:user_id')
  .get(authMiddleware, allowToUserOrAdmin, getUserByUserId)
  .patch(authMiddleware, allowToUserOrAdmin, patchUserByUserId)
  .delete(authMiddleware, allowToUserOrAdmin, deleteUserByUserId);

// Protected route: Get user by Firebase UID (requires authentication, restricts to user (the owner of profile) or admin)
usersRouter
  .route('/firebase/:firebase_uid')
  .get(authMiddleware, allowToUserOrAdmin, getUserByFirebaseUid);

// Protected route: Patch user amenities by user ID (requires authentication, restricts to user (the owner of profile) or admin)
usersRouter
  .route('/:user_id/amenities')
  .patch(authMiddleware, allowToUserOrAdmin, patchUserAmenitiersByUserId);

usersRouter
  .route('/:user_id/favourites')
  .get(authMiddleware, allowToUserOrAdmin, getUserFavouritesByUserId)
  .post(authMiddleware, allowToUserOrAdmin, postUserFavouriteCafeByUserId);

usersRouter
  .route('/:user_id/favourites/:cafe_id')
  .delete(authMiddleware, allowToUserOrAdmin, deleteUserFavouriteCafeByCafeId);

usersRouter
  .route('/:user_id/reviews')
  .get(authMiddleware, allowToUserOrAdmin, getUserReviewsByUserId);

usersRouter
  .route('/:user_id/reviews/:review_id')
  .get(authMiddleware, allowToUserOrAdmin, getUserReviewByReviewId)
  .delete(authMiddleware, allowToUserOrAdmin, deleteUserReviewByReviewId);

module.exports = usersRouter;
