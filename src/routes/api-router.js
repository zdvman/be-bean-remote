const express = require('express');
const apiRouter = express.Router();
const usersRouter = require('./users-router');
const { getApi } = require('./../controllers/api.controller');

apiRouter.route('/').get(getApi);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
