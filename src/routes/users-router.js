// src/routes/users-router.js
const express = require('express');
const usersRouter = express.Router();
const {
  getUsers,
  getUserByUsername,
} = require('../controllers/users.controllers');
const { authMiddleware, restrictTo } = require('../middleware/auth'); // Import both middleware

// Protected route: Get all users (requires authentication, optionally restrict to admins)
usersRouter.route('/').get(authMiddleware, restrictTo('admin'), getUsers);

// Protected route: Get user by username (requires authentication)
usersRouter.route('/:username').get(authMiddleware, getUserByUsername);

module.exports = usersRouter;
