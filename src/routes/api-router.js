const express = require("express");
const apiRouter = express.Router();
const usersRouter = require("./users-router");
const reviewsRouter = require("./reviews-router");
const { getApi } = require("./../controllers/api.controller");

apiRouter.route("/").get(getApi);
apiRouter.use("/users", usersRouter);
apiRouter.use("/reviews", reviewsRouter);

module.exports = apiRouter;
