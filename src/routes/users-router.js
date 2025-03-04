// src/routes/users-router.js
const express = require('express');
const usersRouter = express.Router();
const {
  getUsers,
  // getUserByUsername,
  postUser,
  getUserByUserId,
} = require('../controllers/users.controllers');
const {
  authMiddleware,
  restrictTo,
  allowToUserOrAdmin,
} = require('../middleware/auth'); // Import both middleware

// Protected route: Get all users (requires authentication, optionally restrict to admins)
usersRouter
  .route('/')
  .get(authMiddleware, restrictTo('admin'), getUsers)
  .post(authMiddleware, postUser);

usersRouter
  .route('/:id')
  .get(authMiddleware, allowToUserOrAdmin, getUserByUserId);

// Protected route: Get user by username (requires authentication)
// usersRouter.route('/:username').get(authMiddleware, getUserByUsername);

module.exports = usersRouter;
