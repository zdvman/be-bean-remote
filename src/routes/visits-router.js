// src/routes/users-router.js
const express = require('express');
const visitsRouter = express.Router();
const {
  getVisitsByUser,
  addVisit
} = require('../controllers/visits.controllers');
const { authMiddleware, restrictTo } = require('../middleware/auth'); // Import both middleware

visitsRouter.route('/').get(getVisitsByUser);
visitsRouter.route('/').post(addVisit);


module.exports = visitsRouter;
