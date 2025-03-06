// src/routes/api-router.js

const express = require('express');
const apiRouter = express.Router();
const usersRouter = require('./users-router');
const cafesRouter = require('./cafes-router');
const { getApi } = require('./../controllers/api.controller');

apiRouter.route('/').get(getApi);
apiRouter.use('/users', usersRouter);
apiRouter.use('/cafes', cafesRouter);

module.exports = apiRouter;
