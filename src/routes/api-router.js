const express = require("express");
const apiRouter = express.Router();

const usersRouter = require("./users-router");
const reviewsRouter = require("./reviews-router");
const cafesRouter = require("./cafes-router");
const { getApi } = require("./../controllers/api.controller");

apiRouter.route("/").get(getApi);
apiRouter.use("/users", usersRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/cafes", cafesRouter);

module.exports = apiRouter;
