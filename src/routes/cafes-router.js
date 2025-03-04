// src/routes/users-router.js
const express = require('express');
const cafesRouter = express.Router();
const {
  getCafes,
  getCafeByID
} = require('../controllers/cafes.controllers');
const { authMiddleware, restrictTo } = require('../middleware/auth'); // Import both middleware

cafesRouter.route('/').get(getCafes);
cafesRouter.route('/:id').get(getCafeByID);

// Protected route: Get user by username (requires authentication)
// cafesRouter.route('/:username').get(authMiddleware, getUserByUsername);

module.exports = cafesRouter;