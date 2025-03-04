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

// Protected route: Get all users (requires authentication, restrict to admins only)
usersRouter
  .route('/')
  .get(authMiddleware, restrictTo('admin'), getUsers)
  .post(authMiddleware, postUser);

// Protected route: Get user by user ID (requires authentication, resticts to user (tyhe owner of profile) or admin)
usersRouter
  .route('/:id')
  .get(authMiddleware, allowToUserOrAdmin, getUserByUserId);

module.exports = usersRouter;
