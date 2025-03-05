// src/routes/users-router.js
const express = require('express');
const visitsRouter = express.Router();
const {
  getVisitsByUser
} = require('../controllers/visits.controllers');
const { authMiddleware, restrictTo } = require('../middleware/auth'); // Import both middleware

visitsRouter.route('/').get(getVisitsByUser);


module.exports = visitsRouter;
