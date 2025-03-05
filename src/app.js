const express = require("express");
const app = express();
const cors = require("cors");
const apiRouter = require("./routes/api-router");
// const multer = require('multer');
const {
  handle404,
  handle405,
  handlePSQLErrors,
  handleCustomErrors,
  handle500,
} = require("./middleware/errorHandling");

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
  response.status(200).send({ msg: "Healthcheck is passed" });
});

app.use("/api", apiRouter);

app.use(handle405(app));
app.use(handle404);
app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handle500);

module.exports = app;
